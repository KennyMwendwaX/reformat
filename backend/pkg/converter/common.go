package converter

import (
	"path/filepath"
	"strings"
)

// ConvertOptions holds all conversion settings
type ConvertOptions struct {
	OutputPath         string
	MaxImageWidth      float64
	MarginLeft         float64
	MarginTop          float64
	FontName           string
	FontSize           float64
	LineHeight         float64
	DocxImageWidth     float64 // in inches
	DocxImageMaxHeight float64 // in inches

	// Image format specific options
	JPEGQuality   float64 // 0-100
	GIFNumColors  float64 // 2-256
	PreserveAlpha bool    // Preserve alpha channel when possible
}

// DefaultOptions returns the default conversion options
func DefaultOptions() ConvertOptions {
	return ConvertOptions{
		MaxImageWidth:      190,
		MarginLeft:         10,
		MarginTop:          10,
		FontName:           "Arial",
		FontSize:           12,
		LineHeight:         10,
		DocxImageWidth:     6.0,
		DocxImageMaxHeight: 8.0,
	}
}

// ConvertOption allows for flexible configuration
type ConvertOption func(*ConvertOptions)

type ProgressCallback func(progress float64)

// BaseConverter holds the common conversion options
type BaseConverter struct {
	Options          ConvertOptions
	progressCallback ProgressCallback
}

// WithOutputPath sets a custom output path
func WithOutputPath(path string) ConvertOption {
	return func(o *ConvertOptions) {
		o.OutputPath = path
	}
}

// WithMaxImageWidth sets the maximum image width
func WithMaxImageWidth(width float64) ConvertOption {
	return func(o *ConvertOptions) {
		o.MaxImageWidth = width
	}
}

// Helper function for generating output filenames
func GetOutputFilename(inputFile, newExt string) string {
	ext := filepath.Ext(inputFile)
	return strings.TrimSuffix(inputFile, ext) + newExt
}
