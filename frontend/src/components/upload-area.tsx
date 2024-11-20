import React, { useRef } from "react";
import { Upload } from "lucide-react";

interface UploadAreaProps {
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onFileDrop: (event: React.DragEvent<HTMLDivElement>) => Promise<void>;
}

export default function UploadArea({
  onFileSelect,
  onFileDrop,
}: UploadAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      onDrop={onFileDrop}
      onDragOver={(e) => e.preventDefault()}
      className="border-2 border-dashed border-teal-200 rounded-xl p-10 text-center transition-all duration-300 hover:border-teal-400 hover:bg-teal-50">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={onFileSelect}
      />
      <div
        onClick={() => fileInputRef.current?.click()}
        className="cursor-pointer">
        <Upload className="mx-auto h-16 w-16 text-teal-400 mb-4" />
        <p className="text-xl font-medium text-teal-800 mb-2">
          Drag and drop or click to upload
        </p>
        <p className="text-sm text-teal-600">
          Supports PDF, Word, JPG, PNG, GIF, and SVG formats
        </p>
      </div>
    </div>
  );
}
