package converter

import (
	"fmt"
	"image"
	"os"
	"path/filepath"
	"strings"
	"sync/atomic"

	"github.com/go-pdf/fpdf"
	"github.com/unidoc/unioffice/document"
)

// PDFConverter interface for converting files to PDF
type PDFConverter interface {
	ConvertToPDF(inputFile string, options ...ConvertOption) error
}

// PDFFileConverter handles base PDF conversion functionality
type PDFFileConverter struct {
	BaseConverter
}

func NewPDFConverter() *PDFFileConverter {
	return &PDFFileConverter{
		BaseConverter: BaseConverter{Options: DefaultOptions()},
	}
}

// ConvertToPDF implements basic PDF conversion - this should be overridden by specific converters
func (c *PDFFileConverter) ConvertToPDF(inputFile string, options ...ConvertOption) error {
	return fmt.Errorf("base converter does not implement specific conversion logic")
}

// ImageConverter handles conversion of image files to PDF
type ImageConverter struct {
	PDFFileConverter
}

func NewImageConverter() *ImageConverter {
	return &ImageConverter{
		PDFFileConverter: *NewPDFConverter(),
	}
}

type ProgressCallback func(progress float64)

type ConversionProgress struct {
	totalSteps  int64
	currentStep int64
	onProgress  ProgressCallback
}

func NewConversionProgress(totalSteps int64, callback ProgressCallback) *ConversionProgress {
	return &ConversionProgress{
		totalSteps: totalSteps,
		onProgress: callback,
	}
}

func (p *ConversionProgress) Step() {
	current := atomic.AddInt64(&p.currentStep, 1)
	if p.onProgress != nil {
		progress := (float64(current) / float64(p.totalSteps)) * 100
		p.onProgress(progress)
	}
}

// ConvertToPDF implements the PDFConverter interface for images
func (c *ImageConverter) ConvertToPDF(inputFile string, options ...ConvertOption) error {
	progress := NewConversionProgress(4, func(p float64) {
		fmt.Printf("Conversion progress: %.2f%%\n", p)
	})

	f, err := os.Open(inputFile)
	if err != nil {
		return fmt.Errorf("failed to open image: %w", err)
	}
	defer f.Close()
	progress.Step() // 25%

	img, _, err := image.Decode(f)
	if err != nil {
		return fmt.Errorf("failed to decode image: %w", err)
	}
	progress.Step() // 50%

	bounds := img.Bounds()
	imgWidth := float64(bounds.Dx())
	imgHeight := float64(bounds.Dy())
	// PDF creation and image scaling
	pdf := fpdf.New("P", "mm", "A4", "")
	pdf.AddPage()
	// Scale image to fit on page while maintaining aspect ratio
	width := imgWidth
	height := imgHeight
	if width > c.Options.MaxImageWidth {
		ratio := c.Options.MaxImageWidth / width
		width = c.Options.MaxImageWidth
		height = height * ratio
	}
	progress.Step() // 75%

	pdf.Image(inputFile, c.Options.MarginLeft, c.Options.MarginTop, width, height, false, "", 0, "")

	// Write PDF
	outputFile := GetOutputFilename(inputFile, ".pdf")
	err = pdf.OutputFileAndClose(outputFile)
	progress.Step() // 100%

	return err
}

// DocxConverter handles conversion of Word documents to PDF
type DocxConverter struct {
	PDFFileConverter
}

func NewDocxConverter() *DocxConverter {
	return &DocxConverter{
		PDFFileConverter: *NewPDFConverter(),
	}
}

// ConvertToPDF implements the PDFConverter interface for DOCX files
func (c *DocxConverter) ConvertToPDF(inputFile string, options ...ConvertOption) error {
	// Apply options
	for _, opt := range options {
		opt(&c.Options)
	}

	doc, err := document.Open(inputFile)
	if err != nil {
		return fmt.Errorf("failed to open document: %w", err)
	}
	defer doc.Close()

	pdf := fpdf.New("P", "mm", "A4", "")
	pdf.AddPage()
	pdf.SetFont(c.Options.FontName, "", c.Options.FontSize)

	// Process paragraphs
	for _, para := range doc.Paragraphs() {
		var text strings.Builder

		for _, run := range para.Runs() {
			// Get run properties
			rPr := run.Properties()

			// Handle basic text formatting
			style := ""
			if rPr.IsBold() {
				style += "B"
			}
			if rPr.IsItalic() {
				style += "I"
			}

			// Set the font style for this run
			pdf.SetFont(c.Options.FontName, style, c.Options.FontSize)

			// Add the text
			text.WriteString(run.Text())
		}

		if text.Len() > 0 {
			// Add paragraph spacing
			if pdf.GetY() > c.Options.MarginTop {
				pdf.Ln(c.Options.LineHeight * 0.5)
			}

			// Write paragraph text
			pdf.MultiCell(190, c.Options.LineHeight, text.String(), "", "", false)
		}
	}

	outputFile := c.Options.OutputPath
	if outputFile == "" {
		outputFile = GetOutputFilename(inputFile, ".pdf")
	}

	return pdf.OutputFileAndClose(outputFile)
}

// GetPDFConverter returns the appropriate converter based on file extension
func GetPDFConverter(inputFile string) (PDFConverter, error) {
	ext := strings.ToLower(filepath.Ext(inputFile))
	switch ext {
	case ".jpg", ".jpeg", ".png", ".gif", ".bmp":
		return NewImageConverter(), nil
	case ".doc", ".docx":
		return NewDocxConverter(), nil
	default:
		return nil, fmt.Errorf("unsupported file type: %s", ext)
	}
}
