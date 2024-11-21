import React, { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { getFileTypeFromExtension } from "@/lib/file-utils";
import { FILE_TYPE_CONFIGS } from "@/lib/config";
import { OutputFormat } from "@/lib/types";
import { toast } from "sonner";

interface Props {
  validationError: string | null;
  setSelectedFile: React.Dispatch<React.SetStateAction<File | null>>;
  setFileType: React.Dispatch<React.SetStateAction<string | null>>;
  setOutputFormat: React.Dispatch<React.SetStateAction<OutputFormat | null>>;
  setValidationError: React.Dispatch<React.SetStateAction<string | null>>;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
}

export default function UploadArea({
  validationError,
  setFileType,
  setSelectedFile,
  setOutputFormat,
  setValidationError,
  setCurrentStep,
}: Props) {
  const [isDragging, setIsDragging] = useState(false);

  const detectFileType = async (file: File) => {
    setValidationError(null);
    setFileType(null);
    setOutputFormat(null);

    const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
    if (file.size > MAX_FILE_SIZE) {
      setValidationError("File size exceeds 100MB limit");
      return false;
    }

    const type = file.type || getFileTypeFromExtension(file.name);
    if (!FILE_TYPE_CONFIGS[type]) {
      setValidationError("Unsupported file type");
      return false;
    }

    setFileType(type);
    return true;
  };

  const processSelectedFile = async (file: File) => {
    const isValid = await detectFileType(file);
    if (isValid) {
      setSelectedFile(file);
      toast.success("File type detected successfully!");
      setCurrentStep(1);
    } else {
      setSelectedFile(null);
      toast.error(validationError || "Invalid file");
    }
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      await processSelectedFile(file);
    }
  };

  const handleFileDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files[0];
    if (file) {
      await processSelectedFile(file);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      onDrop={handleFileDrop}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      className={`border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300 
      ${
        isDragging
          ? "border-teal-400 bg-teal-100"
          : "border-teal-200 hover:border-teal-400 hover:bg-teal-50"
      }`}>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileSelect}
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
