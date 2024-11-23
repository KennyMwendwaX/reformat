package converter

import (
	"fmt"
	"image"
	"os"
	"path/filepath"
	"strings"

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

// ConvertToPDF implements the PDFConverter interface for images
func (c *ImageConverter) ConvertToPDF(inputFile string, options ...ConvertOption) error {
	// Apply options
	for _, opt := range options {
		opt(&c.Options)
	}

	// Open and decode image to get actual dimensions
	f, err := os.Open(inputFile)
	if err != nil {
		return fmt.Errorf("failed to open image: %w", err)
	}
	defer f.Close()

	img, _, err := image.Decode(f)
	if err != nil {
		return fmt.Errorf("failed to decode image: %w", err)
	}

	bounds := img.Bounds()
	imgWidth := float64(bounds.Dx())
	imgHeight := float64(bounds.Dy())

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

	pdf.Image(inputFile, c.Options.MarginLeft, c.Options.MarginTop, width, height, false, "", 0, "")

	outputFile := c.Options.OutputPath
	if outputFile == "" {
		outputFile = GetOutputFilename(inputFile, ".pdf")
	}

	return pdf.OutputFileAndClose(outputFile)
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

// getOutputFilename generates the output PDF filename from the input filename

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
