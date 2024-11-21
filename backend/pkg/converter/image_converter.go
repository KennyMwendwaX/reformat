package converter

import (
	"fmt"
	"image"
	"image/gif"
	"image/jpeg"
	"image/png"
	"os"
	"path/filepath"
	"strings"

	"golang.org/x/image/bmp"
)

// ImageConverter interface for image conversion
type ImageConverter interface {
	Convert(inputFile, outputFile string) error
}

// Image handles image type conversion
type Image struct{}

// Convert converts an image file to the specified output format
func (c *Image) Convert(inputFile, outputFormat string) error {
	// Open the input file
	input, err := os.Open(inputFile)
	if err != nil {
		return fmt.Errorf("error opening input file: %w", err)
	}
	defer input.Close()

	// Decode the image and get input format
	img, inputFormat, err := image.Decode(input)
	if err != nil {
		return fmt.Errorf("error decoding image: %w", err)
	}

	// Log format conversion
	fmt.Printf("Converting from %s to %s\n", inputFormat, outputFormat)

	// Generate output filename
	baseName := inputFile[:len(inputFile)-len(filepath.Ext(inputFile))]
	outputFile := fmt.Sprintf("%s.%s", baseName, outputFormat)

	// Create the output file
	output, err := os.Create(outputFile)
	if err != nil {
		return fmt.Errorf("error creating output file: %w", err)
	}
	defer output.Close()

	// Encode the image in the desired format
	switch strings.ToLower(outputFormat) {
	case "jpg", "jpeg":
		err = jpeg.Encode(output, img, &jpeg.Options{Quality: 95})
	case "png":
		err = png.Encode(output, img)
	case "gif":
		err = gif.Encode(output, img, nil)
	case "bmp":
		err = bmp.Encode(output, img)
	default:
		return fmt.Errorf("unsupported output format: %s", outputFormat)
	}

	if err != nil {
		return fmt.Errorf("error encoding image: %w", err)
	}

	return nil
}

// GetSupportedFormats returns a list of supported image formats
func GetSupportedFormats() []string {
	return []string{
		"jpg", "jpeg",
		"png",
		"gif",
		"bmp",
	}
}

// ValidateFormat checks if the given format is supported
func ValidateFormat(format string) bool {
	format = strings.ToLower(format)
	for _, supported := range GetSupportedFormats() {
		if format == supported {
			return true
		}
	}
	return false
}

// ConvertImage is the main conversion function
func ConvertImage(inputFile, outputFormat string) error {
	// Check if input file exists
	if _, err := os.Stat(inputFile); os.IsNotExist(err) {
		return fmt.Errorf("input file does not exist: %s", inputFile)
	}

	// Validate output format
	if !ValidateFormat(outputFormat) {
		return fmt.Errorf("unsupported output format: %s", outputFormat)
	}

	// Create converter and perform conversion
	converter := &Image{}
	return converter.Convert(inputFile, outputFormat)
}
