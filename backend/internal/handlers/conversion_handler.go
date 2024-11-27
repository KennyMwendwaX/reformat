package handlers

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/KennyMwendwaX/reformat/pkg/converter"
)

var allowedFormats = map[string]bool{
	"pdf":  true,
	"docx": true,
	"jpg":  true,
	"jpeg": true,
	"png":  true,
	"gif":  true,
}

// Maximum file size (10MB)
const maxFileSize = 10 << 20

// Add file size validation
func validateFileSize(file io.ReadSeeker) error {
	size, err := file.Seek(0, io.SeekEnd)
	if err != nil {
		return fmt.Errorf("error checking file size: %w", err)
	}
	_, err = file.Seek(0, io.SeekStart)
	if err != nil {
		return fmt.Errorf("error resetting file position: %w", err)
	}
	if size > maxFileSize {
		return fmt.Errorf("file size exceeds maximum allowed size of %d bytes", maxFileSize)
	}
	return nil
}

func isValidFormat(format string) bool {
	format = strings.ToLower(strings.TrimPrefix(format, "."))
	return allowedFormats[format]
}

func Convert(w http.ResponseWriter, r *http.Request) {
	// Add context with timeout
	ctx, cancel := context.WithTimeout(r.Context(), 30*time.Second)
	defer cancel()
	r = r.WithContext(ctx)

	// Add content type validation
	contentType := r.Header.Get("Content-Type")
	if !strings.HasPrefix(contentType, "multipart/form-data") {
		http.Error(w, "Content-Type must be multipart/form-data", http.StatusBadRequest)
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Unable to retrieve file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Validate file size
	if err := validateFileSize(file); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Create temporary directory for conversion
	tempDir, err := os.MkdirTemp("", "conversion-*")
	if err != nil {
		http.Error(w, "Error creating temporary directory", http.StatusInternalServerError)
		return
	}
	defer os.RemoveAll(tempDir)

	tempFile := filepath.Join(tempDir, header.Filename)
	dst, err := os.Create(tempFile)
	if err != nil {
		http.Error(w, "Error saving uploaded file", http.StatusInternalServerError)
		return
	}
	defer dst.Close()

	// Copy with progress monitoring
	written, err := io.Copy(dst, io.TeeReader(file, &progressWriter{total: header.Size}))
	if err != nil || written != header.Size {
		http.Error(w, "Error copying file", http.StatusInternalServerError)
		return
	}

	fmt.Printf("Uploaded file: %s (%d bytes)\n", header.Filename, header.Size)

	to := strings.ToLower(r.URL.Query().Get("to"))

	if to == "" {
		http.Error(w, "Missing 'to' query parameter", http.StatusBadRequest)
		return
	}

	if !isValidFormat(to) {
		http.Error(w, fmt.Sprintf("Invalid 'to' format: %s", to), http.StatusBadRequest)
		return
	}

	switch to {
	case "pdf":
		pdfConverter, err := converter.GetPDFConverter(header.Filename)
		if err != nil {
			http.Error(w, fmt.Sprintf("Converter error: %v", err), http.StatusBadRequest)
			return
		}

		err = pdfConverter.ConvertToPDF(tempFile) // Changed from header.Filename to tempFile
		if err != nil {
			http.Error(w, fmt.Sprintf("Conversion error: %v", err), http.StatusInternalServerError)
			return
		}

		outputFile := converter.GetOutputFilename(tempFile, ".pdf")
		convertedData, err := os.ReadFile(outputFile)
		if err != nil {
			http.Error(w, "Error reading converted file", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/pdf")
		w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s.pdf",
			strings.TrimSuffix(header.Filename, filepath.Ext(header.Filename))))
		w.Write(convertedData)

	case "docx":
		docxConverter, err := converter.GetDocxConverter(tempFile)
		if err != nil {
			http.Error(w, fmt.Sprintf("Converter error: %v", err), http.StatusBadRequest)
			return
		}

		err = docxConverter.ConvertToDocx(tempFile)
		if err != nil {
			http.Error(w, fmt.Sprintf("Conversion error: %v", err), http.StatusInternalServerError)
			return
		}

		outputFile := converter.GetOutputFilename(tempFile, ".docx")
		defer os.Remove(outputFile)

		convertedData, err := os.ReadFile(outputFile)
		if err != nil {
			http.Error(w, "Error reading converted file", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
		w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s.docx",
			strings.TrimSuffix(header.Filename, filepath.Ext(header.Filename))))
		w.Write(convertedData)

	case "jpg", "jpeg", "png", "gif":
		imgConverter := converter.NewImageFormatConverter()
		err := imgConverter.Convert(tempFile, to)
		if err != nil {
			http.Error(w, fmt.Sprintf("Conversion error: %v", err), http.StatusInternalServerError)
			return
		}

		outputFile := converter.GetOutputFilename(tempFile, "."+to)
		defer os.Remove(outputFile)

		convertedData, err := os.ReadFile(outputFile)
		if err != nil {
			http.Error(w, "Error reading converted file", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", getContentType(to))
		w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s.%s",
			strings.TrimSuffix(header.Filename, filepath.Ext(header.Filename)), to))
		w.Write(convertedData)

	default:
		http.Error(w, fmt.Sprintf("Unsupported conversion to format: %s", to), http.StatusBadRequest)
		return
	}
}

func getContentType(format string) string {
	switch format {
	case "pdf":
		return "application/pdf"
	case "docx":
		return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
	case "jpg", "jpeg":
		return "image/jpeg"
	case "png":
		return "image/png"
	case "gif":
		return "image/gif"
	default:
		return "application/octet-stream"
	}
}

// Progress monitoring
type progressWriter struct {
	total   int64
	current int64
	lastLog time.Time
}

func (pw *progressWriter) Write(p []byte) (n int, err error) {
	n = len(p)
	pw.current += int64(n)

	if time.Since(pw.lastLog) >= time.Second {
		progress := float64(pw.current) / float64(pw.total) * 100
		fmt.Printf("Progress: %.2f%%\n", progress)
		pw.lastLog = time.Now()
	}
	return n, nil
}
