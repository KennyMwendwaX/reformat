package converter

import (
	"fmt"
	"os/exec"
	"path/filepath"
	"strings"

	"github.com/unidoc/unioffice/common"
	"github.com/unidoc/unioffice/document"
	"github.com/unidoc/unioffice/measurement"
)

// DocxConverterInterface interface for converting files to DOCX
type DocxConverterInterface interface {
	ConvertToDocx(inputFile string, options ...ConvertOption) error
}

// DocxFileConverter handles base DOCX conversion functionality
type DocxFileConverter struct {
	BaseConverter
}

func NewDocxFileConverter() *DocxFileConverter {
	return &DocxFileConverter{
		BaseConverter: BaseConverter{Options: DefaultOptions()},
	}
}

// PDFToDocxConverter handles conversion of PDF files to DOCX
type PDFToDocxConverter struct {
	DocxFileConverter
}

func NewPDFToDocxConverter() *PDFToDocxConverter {
	return &PDFToDocxConverter{
		DocxFileConverter: *NewDocxFileConverter(),
	}
}

// ImageToDocxConverter handles conversion of image files to DOCX
type ImageToDocxConverter struct {
	DocxFileConverter
}

func NewImageToDocxConverter() *ImageToDocxConverter {
	return &ImageToDocxConverter{
		DocxFileConverter: *NewDocxFileConverter(),
	}
}

// ConvertToDocx implements basic DOCX conversion - this should be overridden by specific converters
func (c *DocxFileConverter) ConvertToDocx(inputFile string, options ...ConvertOption) error {
	return fmt.Errorf("base converter does not implement specific conversion logic")
}

// ConvertToDocx converts a PDF file to DOCX format
func (c *PDFToDocxConverter) ConvertToDocx(inputFile string, options ...ConvertOption) error {
	// Apply options
	for _, opt := range options {
		opt(&c.Options)
	}

	text, err := extractTextFromPDF(inputFile)
	if err != nil {
		return fmt.Errorf("error extracting text: %w", err)
	}

	doc := document.New()
	paragraphs := strings.Split(text, "\n\n")
	for _, p := range paragraphs {
		if strings.TrimSpace(p) != "" {
			para := doc.AddParagraph()
			run := para.AddRun()
			run.AddText(strings.TrimSpace(p))
		}
	}

	outputFile := c.Options.OutputPath
	if outputFile == "" {
		outputFile = GetOutputFilename(inputFile, ".docx")
	}
	return doc.SaveToFile(outputFile)
}

// ConvertToDocx converts an image file to DOCX format
func (c *ImageToDocxConverter) ConvertToDocx(inputFile string, options ...ConvertOption) error {
	// Apply options
	for _, opt := range options {
		opt(&c.Options)
	}

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

	width := measurement.Distance(c.Options.DocxImageWidth * measurement.Inch)
	aspectRatio := float64(img.Size.Y) / float64(img.Size.X)
	height := measurement.Distance(c.Options.DocxImageWidth * aspectRatio * measurement.Inch)

	// Ensure height doesn't exceed maximum
	if height > measurement.Distance(c.Options.DocxImageMaxHeight*measurement.Inch) {
		height = measurement.Distance(c.Options.DocxImageMaxHeight * measurement.Inch)
		width = height / measurement.Distance(aspectRatio)
	}

	inl.SetSize(width, height)

	outputFile := c.Options.OutputPath
	if outputFile == "" {
		outputFile = GetOutputFilename(inputFile, ".docx")
	}
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

// GetDocxConverter returns appropriate converter based on file type
func GetDocxConverter(inputFile string) (DocxConverterInterface, error) {
	ext := strings.ToLower(filepath.Ext(inputFile))
	switch ext {
	case ".jpg", ".jpeg", ".png", ".gif", ".bmp":
		return NewImageToDocxConverter(), nil
	case ".pdf":
		return NewPDFToDocxConverter(), nil
	case ".docx":
		return nil, fmt.Errorf("file is already in DOCX format: %s", inputFile)
	default:
		return nil, fmt.Errorf("unsupported file type: %s", ext)
	}
}
