package converter

import (
	"fmt"
	"image"
	"image/gif"
	"image/jpeg"
	"image/png"
	"os"
	"strings"

	"golang.org/x/image/bmp"
)

// ImageFormatConverterInterface interface for converting image formats
type ImageFormatConverterInterface interface {
	Convert(inputFile string, outputFormat string, options ...ConvertOption) error
}

// ImageFormatConverter handles image format conversions
type ImageFormatConverter struct {
	BaseConverter
}

// NewImageFormatConverter creates a new ImageFormatConverter
func NewImageFormatConverter() *ImageFormatConverter {
	return &ImageFormatConverter{
		BaseConverter: BaseConverter{Options: DefaultOptions()},
	}
}

// Convert converts an image file to the specified output format
func (c *ImageFormatConverter) Convert(inputFile string, outputFormat string, options ...ConvertOption) error {
	// Apply options
	for _, opt := range options {
		opt(&c.Options)
	}

	// Validate input
	if !ValidateFormat(outputFormat) {
		return fmt.Errorf("unsupported output format: %s", outputFormat)
	}

	// Open input file
	input, err := os.Open(inputFile)
	if err != nil {
		return fmt.Errorf("error opening input file: %w", err)
	}
	defer input.Close()

	// Decode image
	img, format, err := image.Decode(input)
	if err != nil {
		return fmt.Errorf("error decoding image format %s: %w", format, err)
	}

	// Generate output filename
	outputFile := c.Options.OutputPath
	if outputFile == "" {
		outputFile = GetOutputFilename(inputFile, "."+outputFormat)
	}

	// Create output file
	output, err := os.Create(outputFile)
	if err != nil {
		return fmt.Errorf("error creating output file: %w", err)
	}
	defer output.Close()

	// Encode image in new format
	switch strings.ToLower(outputFormat) {
	case "jpg", "jpeg":
		err = jpeg.Encode(output, img, &jpeg.Options{
			Quality: int(c.Options.JPEGQuality),
		})
	case "png":
		err = png.Encode(output, img)
	case "gif":
		err = gif.Encode(output, img, &gif.Options{
			NumColors: int(c.Options.GIFNumColors),
		})
	case "bmp":
		err = bmp.Encode(output, img)
	default:
		return fmt.Errorf("unsupported output format: %s", outputFormat)
	}

	if err != nil {
		return fmt.Errorf("error encoding image to %s: %w", outputFormat, err)
	}

	return nil
}

// Format represents an image format
type Format struct {
	Name        string
	Extensions  []string
	Description string
}

// SupportedFormats defines all supported image formats
var SupportedFormats = []Format{
	{
		Name:        "JPEG",
		Extensions:  []string{"jpg", "jpeg"},
		Description: "Joint Photographic Experts Group",
	},
	{
		Name:        "PNG",
		Extensions:  []string{"png"},
		Description: "Portable Network Graphics",
	},
	{
		Name:        "GIF",
		Extensions:  []string{"gif"},
		Description: "Graphics Interchange Format",
	},
	{
		Name:        "BMP",
		Extensions:  []string{"bmp"},
		Description: "Bitmap Image File",
	},
}

// GetSupportedFormats returns a list of supported image formats
func GetSupportedFormats() []string {
	var formats []string
	for _, format := range SupportedFormats {
		formats = append(formats, format.Extensions...)
	}
	return formats
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

// GetFormatInfo returns detailed information about a supported format
func GetFormatInfo(format string) (*Format, error) {
	format = strings.ToLower(format)
	for _, f := range SupportedFormats {
		for _, ext := range f.Extensions {
			if format == ext {
				return &f, nil
			}
		}
	}
	return nil, fmt.Errorf("unsupported format: %s", format)
}

func init() {
	// Set default values for image-specific options in ConvertOptions
	defaultOpts := DefaultOptions()
	defaultOpts.JPEGQuality = 75
	defaultOpts.GIFNumColors = 256
}
