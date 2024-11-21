package converter

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/go-pdf/fpdf"
	"github.com/unidoc/unioffice/document"
)

type Converter interface {
	ConvertToPDF(inputFile string) error
}

type ImageConverter struct{}

func (c *ImageConverter) ConvertToPDF(inputFile string) error {
	pdf := fpdf.New("P", "mm", "A4", "")
	pdf.AddPage()

	// Get image dimensions and add to PDF
	imageInfo := pdf.RegisterImage(inputFile, "")
	if imageInfo != nil {
		width, height := imageInfo.Extent()
		// Scale image to fit on page while maintaining aspect ratio
		if width > 190 {
			ratio := 190.0 / width
			width = 190
			height = height * ratio
		}
		pdf.Image(inputFile, 10, 10, width, height, false, "", 0, "")
	}

	outputFile := fmt.Sprintf("%s.pdf", inputFile[:len(inputFile)-len(filepath.Ext(inputFile))])
	return pdf.OutputFileAndClose(outputFile)
}

type WordConverter struct{}

func (c *WordConverter) ConvertToPDF(inputFile string) error {
	// Open DOCX file
	doc, err := document.Open(inputFile)
	if err != nil {
		return err
	}

	// Create PDF
	pdf := fpdf.New("P", "mm", "A4", "")
	pdf.AddPage()
	pdf.SetFont("Arial", "", 12)

	// Extract text and write to PDF
	for _, para := range doc.Paragraphs() {
		text := ""
		for _, run := range para.Runs() {
			text += run.Text()
		}
		if text != "" {
			pdf.MultiCell(190, 10, text, "", "", false)
		}
	}

	// Save to output file
	outputFile := fmt.Sprintf("%s.pdf", inputFile[:len(inputFile)-len(filepath.Ext(inputFile))])
	return pdf.OutputFileAndClose(outputFile)
}

// Conversion factory
func GetConverter(inputFile string) (Converter, error) {
	ext := filepath.Ext(inputFile)
	switch ext {
	case ".jpg", ".jpeg", ".png", ".gif", ".bmp":
		return &ImageConverter{}, nil
	case ".doc", ".docx":
		return &WordConverter{}, nil
	default:
		return nil, fmt.Errorf("unsupported file type: %s", ext)
	}
}

// Main conversion function
func ConvertFileToPDF(inputFile string) error {
	if _, err := os.Stat(inputFile); os.IsNotExist(err) {
		return fmt.Errorf("file does not exist: %s", inputFile)
	}

	converter, err := GetConverter(inputFile)
	if err != nil {
		return err
	}

	return converter.ConvertToPDF(inputFile)
}
