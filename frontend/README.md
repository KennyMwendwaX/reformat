# Reformat Frontend

A modern Next.js application for converting files between different formats with a sleek, user-friendly interface.

## Features

- 🎯 Intuitive drag-and-drop file upload
- 🔄 Support for multiple file formats (PDF, Word, Images)
- ⚡ Real-time conversion progress tracking
- 🎨 Quality settings for optimized conversions
- 📱 Responsive design with Tailwind CSS
- 🎭 Smooth animations and transitions
- 📊 Recent conversions history

## Tech Stack

- **Framework:** Next.js 14
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Icons:** Lucide React
- **Animations:** Motion React
- **Notifications:** Sonner

## Getting Started

### Prerequisites

- **Node.js** 18.0 or higher
- **npm**, **pnpm**, **bun** or **yarn**

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd reformat/frontend
   ```

1. Install Dependencies:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```
1. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```
1. Open http://localhost:3000 with your browser to see the result.

### Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js app router files
│   │   ├── globals.css         # Global styles
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Home page
│   ├── components/             # React components
│   │   ├── conversion-config.ts
│   │   └── upload-area.ts
│   └── lib/                    # Utility functions and configs
│       ├── config.ts           # File type configurations
│       ├── file-utils.ts       # File handling utilities
│       ├── types.ts            # TypeScript type definitions
│       └── utils.ts            # General utilities
├── next.config.ts
├── tailwind.config.ts
├── components.json
├── package-lock.json
├── package.json
├── tsconfig.json
├── .gitignore
└── README.md
```

### Key Components

**UploadArea**

- Handles file drag-and-drop and selection
- Validates file types and sizes
- Provides real-time feedback

**ConversionConfig**

- Manages conversion settings
- Supports multiple output formats
- Provides real-time feedback

### File Type Support

**Input Formats**

- Images: JPG, PNG, GIF, SVG
- Documents: PDF, DOCX
- Maximum file size: 100MB

**Output Formats**

- PDF → DOCX, JPG, PNG
- DOCX → PDF
- Images → PDF, various image formats

### Configuration

- **tailwind.config.ts**: Tailwind CSS configuration
- **next.config.ts**: Next.js configuration
- **components.json**: shadcn/ui components configuration
