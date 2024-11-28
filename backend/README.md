# Reformat Backend

The backend service for the Reformat application, built with Go. This service handles file conversion requests, providing endpoints for uploading files and converting them between supported formats.

## Features

- 🌐 **API Endpoints** for file upload and conversion
- ⚡ **Support for multiple formats:** PDF, DOCX, JPG, PNG, GIF
- 🕒 **Context-based timeouts** for reliable request handling
- 🗂 **Temporary file handling** with automatic cleanup
- 📊 **Progress monitoring** for large file uploads

## Tech Stack

- **Language:** Go
- **Server Framework:** net/http
- **File Handling:** Built-in Go libraries
- **Conversion Libraries:** Custom-built converters

## Project Structure

```plaintext
backend/
├── cmd/                    # Main application entry points
│   └── main.go             # Server entry point
├── internal/               # Private application code
│   └── handlers/           # HTTP request handlers
│       └── conversion_handler.go
├── pkg/                    # Public packages
│    └── converter/          # Conversion libraries
│        ├── common.go
│        ├── pdf_converter.go
│        ├── image_converter.go
│        └── docx_converter.go
├── go.mod
├── go.sum
└── README.md
```

## API Endpoints

**POST /api/convert**: Handles file uploads and converts the file to the specified format.

**Request Parameters**

- **Headers**: Content-Type: multipart/form-data
- **Form Data**: file: The file to be converted.
- **Query Parameters**: to: Target file format (pdf, docx, jpg, png, gif).

**Example Request**

```bash
curl -X POST -F "file=@example.docx" "http://localhost:8000/api/convert?to=pdf"

```

**Example Response**

- On success:
  - Status: 200 OK
  - Content-Type: Based on the target format
  - File: Converted file as a download
- On error:
  - Status: 400 Bad Request or 500 Internal Server Error
  - Message: Error details

## Setup

### Prerequisites

- **GO** 1.20 or higher

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/KennyMwendwaX/reformat
    cd reformat/backend
    ```
1.  Build the application:
    ```bash
    go build -o reformat-backend ./cmd/main.go
    cd reformat/backend
    ```
1.  Run the server:
    ```bash
    ./reformat-backend
    ```

The server will start on http://localhost:8000.

## Configuration

- **Server Settings:**
  Configurable timeouts for reliable performance:
  - ReadTimeout: 10s
  - WriteTimeout: 30s
- **File Size Limit:**:
  Maximum upload size: 10 MB

## File Type Support

**Input Formats**

- Images: JPG, PNG, GIF, SVG
- Documents: PDF, DOCX
- Maximum file size: 100MB

**Output Formats**

- PDF → DOCX, JPG, PNG
- DOCX → PDF
- Images → PDF, various image formats
