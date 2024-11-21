package converter

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/go-pdf/fpdf"
	"github.com/unidoc/unioffice/document"
)

// PDFConverter defines the interface for converting files to PDF
type PDFConverter interface {
	ConvertToPDF(inputFile string) error
}

// ImageConverter handles conversion of image files to PDF
type FileImage struct{}

func (c *FileImage) ConvertToPDF(inputFile string) error {
	pdf := fpdf.New("P", "mm", "A4", "")
	pdf.AddPage()

	// Get image dimensions and add to PDF
	imageInfo := pdf.RegisterImage(inputFile, "")
	if imageInfo == nil {
		return fmt.Errorf("failed to register image: %s", inputFile)
	}

	width, height := imageInfo.Extent()
	// Scale image to fit on page while maintaining aspect ratio
	if width > 190 {
		ratio := 190.0 / width
		width = 190
		height = height * ratio
	}
	pdf.Image(inputFile, 10, 10, width, height, false, "", 0, "")

	outputFile := getOutputFilename(inputFile)
	return pdf.OutputFileAndClose(outputFile)
}

// DOCX handles conversion of Word documents to PDF
type DOCX struct{}

func (c *DOCX) ConvertToPDF(inputFile string) error {
	// Open DOCX file
	doc, err := document.Open(inputFile)
	if err != nil {
		return fmt.Errorf("failed to open document: %w", err)
	}
	defer doc.Close()

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
	outputFile := getOutputFilename(inputFile)
	return pdf.OutputFileAndClose(outputFile)
}

// Helper function to generate output filename
func getOutputFilename(inputFile string) string {
	return fmt.Sprintf("%s.pdf", inputFile[:len(inputFile)-len(filepath.Ext(inputFile))])
}

// GetPDFConverter returns the appropriate converter based on file extension
func GetPDFConverter(inputFile string) (PDFConverter, error) {
	ext := strings.ToLower(filepath.Ext(inputFile))
	switch ext {
	case ".jpg", ".jpeg", ".png", ".gif", ".bmp":
		return &FileImage{}, nil
	case ".doc", ".docx":
		return &DOCX{}, nil
	default:
		return nil, fmt.Errorf("unsupported file type: %s", ext)
	}
}

// ConvertToPDF converts the input file to PDF format
func ConvertToPDF(inputFile string) error {
	// Validate input file exists
	if _, err := os.Stat(inputFile); os.IsNotExist(err) {
		return fmt.Errorf("file does not exist: %s", inputFile)
	}

	// Get appropriate converter
	converter, err := GetPDFConverter(inputFile)
	if err != nil {
		return err
	}

	// Perform conversion
	if err := converter.ConvertToPDF(inputFile); err != nil {
		return fmt.Errorf("conversion failed: %w", err)
	}

	return nil
}
