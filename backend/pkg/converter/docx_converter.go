package converter

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"github.com/unidoc/unioffice/common"
	"github.com/unidoc/unioffice/document"
	"github.com/unidoc/unioffice/measurement"
)

// DocxConverter interface for DOCX conversion
type DocxConverter interface {
	ConvertToDocx(inputFile string) error
}

// ImageFile handles image to DOCX conversion
type ImageFile struct{}

func (c *ImageFile) ConvertToDocx(inputFile string) error {
	doc := document.New()
	para := doc.AddParagraph()

	img, err := common.ImageFromFile(inputFile)
	if err != nil {
		return fmt.Errorf("error loading image: %w", err)
	}

	imgRef, err := doc.AddImage(img)
	if err != nil {
		return fmt.Errorf("error adding image to document: %w", err)
	}

	inl, err := para.AddRun().AddDrawingInline(imgRef)
	if err != nil {
		return fmt.Errorf("error adding inline drawing: %w", err)
	}

	// Set reasonable default size while maintaining aspect ratio
	widthInches := float64(6.0)
	width := measurement.Distance(widthInches * measurement.Inch)
	aspectRatio := float64(img.Size.Y) / float64(img.Size.X)
	height := measurement.Distance(widthInches * aspectRatio * measurement.Inch)

	inl.SetSize(width, height)

	outputFile := fmt.Sprintf("%s.docx", inputFile[:len(inputFile)-len(filepath.Ext(inputFile))])
	return doc.SaveToFile(outputFile)
}

// PDF handles PDF to DOCX conversion
type PDF struct{}

func (c *PDF) ConvertToDocx(inputFile string) error {
	// Extract text from PDF
	text, err := extractTextFromPDF(inputFile)
	if err != nil {
		return fmt.Errorf("error extracting text: %w", err)
	}

	// Create new document
	doc := document.New()

	// Split text into paragraphs and add to document
	paragraphs := strings.Split(text, "\n\n")
	for _, p := range paragraphs {
		if strings.TrimSpace(p) != "" {
			para := doc.AddParagraph()
			run := para.AddRun()
			run.AddText(strings.TrimSpace(p))
		}
	}

	outputFile := fmt.Sprintf("%s.docx", inputFile[:len(inputFile)-len(filepath.Ext(inputFile))])
	return doc.SaveToFile(outputFile)
}

// Helper function for PDF text extraction
func extractTextFromPDF(inputFile string) (string, error) {
	cmd := exec.Command("pdftotext", inputFile, "-")
	output, err := cmd.Output()
	if err != nil {
		return "", fmt.Errorf("pdftotext error: %w", err)
	}
	return string(output), nil
}

// GetDOCXConverter returns appropriate converter based on file type
func GetDOCXConverter(inputFile string) (DocxConverter, error) {
	ext := strings.ToLower(filepath.Ext(inputFile))
	switch ext {
	case ".jpg", ".jpeg", ".png", ".gif", ".bmp":
		return &ImageFile{}, nil
	case ".pdf":
		return &PDF{}, nil
	case ".docx":
		return nil, fmt.Errorf("file is already in DOCX format: %s", inputFile)
	default:
		return nil, fmt.Errorf("unsupported file type: %s", ext)
	}
}

// ConvertToDocx is the main conversion function
func ConvertToDocx(inputFile string) error {
	// Check if file exists
	if _, err := os.Stat(inputFile); os.IsNotExist(err) {
		return fmt.Errorf("file does not exist: %s", inputFile)
	}

	// Get appropriate converter
	converter, err := GetDOCXConverter(inputFile)
	if err != nil {
		return err
	}

	// Perform conversion
	return converter.ConvertToDocx(inputFile)
}
