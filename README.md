# Reformat

Reformat is a modern file conversion tool designed to handle multiple file formats with ease and efficiency. It consists of a **Next.js-based frontend** and a **Go-based backend**, providing a sleek interface for uploading and converting files.

---

## Features

### 🌟 Frontend

- Intuitive drag-and-drop file upload
- Real-time conversion progress tracking
- Responsive design with **Tailwind CSS**
- Quality settings for optimized conversions
- Smooth animations and transitions

### 🛠 Backend

- Support for multiple formats: **PDF, DOCX, Images (JPG, PNG, GIF)**
- Context-based request handling with timeouts
- Temporary file storage with cleanup
- Progress monitoring for large file uploads

---

## Tech Stack

### Frontend

- **Framework:** Next.js 14
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Animations:** Motion React

### Backend

- **Language:** Go
- **Server Framework:** net/http
- **Conversion Libraries:** Custom-built converters

---

## Project Structure

```plaintext
reformat/
├── frontend/
│    ├── src/
│    │   ├── app/                    # Next.js app router files
│    │   │   ├── globals.css         # Global styles
│    │   │   ├── layout.tsx          # Root layout
│    │   │   └── page.tsx            # Home page
│    │   ├── components/             # React components
│    │   │   ├── conversion-config.ts
│    │   │   └── upload-area.ts
│    │   └── lib/                    # Utility functions and configs
│    │       ├── config.ts           # File type configurations
│    │       ├── file-utils.ts       # File handling utilities
│    │       ├── types.ts            # TypeScript type definitions
│    │       └── utils.ts            # General utilities
│    ├── next.config.ts
│    ├── tailwind.config.ts
│    ├── components.json
│    ├── package-lock.json
│    ├── package.json
│    ├── tsconfig.json
│    ├── .gitignore
│    └── README.md
├── backend/
│   ├── cmd/                    # Main application entry points
│   │   └── main.go             # Server entry point
│   ├── internal/               # Private application code
│   │   └── handlers/           # HTTP request handlers
│   │       └── conversion_handler.go
│   ├── pkg/                    # Public packages
│   │    └── converter/          # Conversion libraries
│   │        ├── common.go
│   │        ├── pdf_converter.go
│   │        ├── image_converter.go
│   │        └── docx_converter.go
│   ├── go.mod
│   ├── go.sum
│   └── README.md
└── README.md              # Project documentation
```
