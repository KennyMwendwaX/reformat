package handlers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"

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

func isValidFormat(format string) bool {
	format = strings.ToLower(strings.TrimPrefix(format, "."))
	return allowedFormats[format]
}

func Convert(w http.ResponseWriter, r *http.Request) {
	from := strings.ToLower(r.URL.Query().Get("from"))
	to := strings.ToLower(r.URL.Query().Get("to"))

	if from == "" || to == "" {
		http.Error(w, "Missing 'from' or 'to' query parameters", http.StatusBadRequest)
		return
	}

	if !isValidFormat(from) {
		http.Error(w, fmt.Sprintf("Invalid 'from' format: %s", from), http.StatusBadRequest)
		return
	}
	if !isValidFormat(to) {
		http.Error(w, fmt.Sprintf("Invalid 'to' format: %s", to), http.StatusBadRequest)
		return
	}

	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		http.Error(w, "Unable to parse form", http.StatusBadRequest)
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Unable to retrieve file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	fileExt := strings.ToLower(filepath.Ext(header.Filename))
	if fileExt != "" {
		fileExt = strings.TrimPrefix(fileExt, ".")
		if fileExt != from {
			http.Error(w, fmt.Sprintf("File extension '%s' doesn't match 'from' parameter '%s'", fileExt, from), http.StatusBadRequest)
			return
		}
	}

	// Save uploaded file temporarily
	tempFile := filepath.Join(os.TempDir(), header.Filename)
	dst, err := os.Create(tempFile)
	if err != nil {
		http.Error(w, "Error saving uploaded file", http.StatusInternalServerError)
		return
	}
	defer func() {
		dst.Close()
		os.Remove(tempFile) // Clean up temporary file
	}()

	fmt.Printf("Uploaded file: %s (%d bytes)\n", header.Filename, header.Size)

	switch to {
	case "pdf":
		pdfConverter, err := converter.GetPDFConverter(header.Filename)
		if err != nil {
			http.Error(w, fmt.Sprintf("Converter error: %v", err), http.StatusBadRequest)
			return
		}

		err = pdfConverter.ConvertToPDF(header.Filename)
		if err != nil {
			http.Error(w, fmt.Sprintf("Conversion error: %v", err), http.StatusInternalServerError)
			return
		}

		// Read the converted file
		outputFile := converter.GetOutputFilename(header.Filename, ".pdf")
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
