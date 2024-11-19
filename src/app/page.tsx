"use client";

import React, { useState, useRef } from "react";
import {
  FileDown,
  Upload,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast, Toaster } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type FileStatus = "idle" | "uploading" | "converting" | "completed" | "failed";
type OutputFormat = "pdf" | "docx" | "jpg" | "png" | "svg" | "gif";
type ConversionQuality = "fast" | "balanced" | "high";

interface ConvertedFile {
  id: string;
  originalName: string;
  originalType: string;
  outputFormat: OutputFormat;
  status: FileStatus;
  progress: number;
  size: string;
  convertedAt: Date;
}

// File type configurations
const FILE_TYPE_CONFIGS = {
  // Image formats
  "image/jpeg": {
    icon: "🖼️",
    allowedOutputs: ["pdf", "png", "jpg", "gif"] as OutputFormat[],
    description: "JPEG Image",
  },
  "image/png": {
    icon: "🖼️",
    allowedOutputs: ["pdf", "jpg", "gif"] as OutputFormat[],
    description: "PNG Image",
  },
  "image/gif": {
    icon: "🎭",
    allowedOutputs: ["jpg", "png", "pdf"] as OutputFormat[],
    description: "GIF Animation",
  },
  "image/svg+xml": {
    icon: "📐",
    allowedOutputs: ["png", "jpg", "pdf"] as OutputFormat[],
    description: "SVG Vector",
  },
  // Document formats
  "application/pdf": {
    icon: "📄",
    allowedOutputs: ["docx", "jpg", "png"] as OutputFormat[],
    description: "PDF Document",
  },
  "application/msword": {
    icon: "📝",
    allowedOutputs: ["pdf", "docx"] as OutputFormat[],
    description: "Word Document",
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
    icon: "📝",
    allowedOutputs: ["pdf"] as OutputFormat[],
    description: "Word Document",
  },
  // Add more file types as needed
};

const ReformatConverter: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [outputFormat, setOutputFormat] = useState<OutputFormat | null>(null);
  const [quality, setQuality] = useState<ConversionQuality>("balanced");
  const [convertedFiles, setConvertedFiles] = useState<ConvertedFile[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const detectFileType = async (file: File) => {
    // Reset states
    setValidationError(null);
    setFileType(null);
    setOutputFormat(null);

    // Check file size (e.g., 100MB limit)
    const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB in bytes
    if (file.size > MAX_FILE_SIZE) {
      setValidationError("File size exceeds 100MB limit");
      return false;
    }

    // Get file type from mime type
    const type = file.type;

    // If no mime type, try to detect from file extension
    if (!type) {
      const extension = file.name.split(".").pop()?.toLowerCase();
      // Map common extensions to mime types
      const extensionMimeMap: { [key: string]: string } = {
        pdf: "application/pdf",
        doc: "application/msword",
        docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        gif: "image/gif",
        svg: "image/svg+xml",
      };
      const mimeType = extension ? extensionMimeMap[extension] : null;

      if (!mimeType) {
        setValidationError("Unsupported file type");
        return false;
      }

      setFileType(mimeType);
      return true;
    }

    // Check if file type is supported
    if (!FILE_TYPE_CONFIGS[type as keyof typeof FILE_TYPE_CONFIGS]) {
      setValidationError("Unsupported file type");
      return false;
    }

    setFileType(type);
    return true;
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const isValid = await detectFileType(file);
      if (isValid) {
        setSelectedFile(file);
        toast.success("File type detected successfully!");
      } else {
        setSelectedFile(null);
        toast.error(validationError || "Invalid file");
      }
    }
  };

  const handleFileDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      const isValid = await detectFileType(file);
      if (isValid) {
        setSelectedFile(file);
        toast.success("File type detected successfully!");
      } else {
        setSelectedFile(null);
        toast.error(validationError || "Invalid file");
      }
    }
  };

  const formatFileSize = (bytes: number): string => {
    const units = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + units[i];
  };

  const getAllowedOutputFormats = () => {
    if (!fileType) return [];
    const config =
      FILE_TYPE_CONFIGS[fileType as keyof typeof FILE_TYPE_CONFIGS];
    return config ? config.allowedOutputs : [];
  };

  const getFileTypeInfo = () => {
    if (!fileType) return null;
    return FILE_TYPE_CONFIGS[fileType as keyof typeof FILE_TYPE_CONFIGS];
  };

  const simulateConversion = async () => {
    if (!selectedFile || !outputFormat || !fileType) {
      toast.error("Please select a file and output format");
      return;
    }

    setIsConverting(true);
    const newFileEntry: ConvertedFile = {
      id: Date.now().toString(),
      originalName: selectedFile.name,
      originalType: fileType,
      outputFormat,
      status: "converting",
      progress: 0,
      size: formatFileSize(selectedFile.size),
      convertedAt: new Date(),
    };

    setConvertedFiles((prev) => [newFileEntry, ...prev]);

    try {
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        setConvertedFiles((prev) =>
          prev.map((file) =>
            file.id === newFileEntry.id
              ? {
                  ...file,
                  progress,
                  status: progress === 100 ? "completed" : "converting",
                }
              : file
          )
        );
      }

      toast.success(
        `File converted to ${outputFormat.toUpperCase()} successfully!`
      );
    } catch (error) {
      console.log(error);
      toast.error("Conversion failed. Please try again.");
      setConvertedFiles((prev) =>
        prev.map((file) =>
          file.id === newFileEntry.id
            ? { ...file, status: "failed", progress: 0 }
            : file
        )
      );
    } finally {
      setIsConverting(false);
      setSelectedFile(null);
      setFileType(null);
      setOutputFormat(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 md:p-8">
      <Toaster richColors />
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mb-4 shadow-lg">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Reformat
          </h1>
          <p className="mt-4 text-gray-600 text-xl max-w-2xl mx-auto">
            Transform files effortlessly with advanced conversion capabilities
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* File Upload Section */}
          <Card className="lg:col-span-2 border-0 shadow-xl bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-gray-800">
                File Conversion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                onDrop={handleFileDrop}
                onDragOver={(e) => e.preventDefault()}
                className={`
                  border-2 border-dashed rounded-2xl p-8 text-center 
                  transition-all duration-300
                  ${
                    selectedFile
                      ? "border-indigo-300 bg-indigo-50/50"
                      : "border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/30"
                  }
                `}>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileSelect}
                />
                {!selectedFile ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer">
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-lg font-medium text-gray-700">
                      Drag and drop or click to upload
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Supports common document and image formats
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-4xl mb-2">
                      {getFileTypeInfo()?.icon || "📄"}
                    </div>
                    <div>
                      <p className="text-lg font-semibold">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatFileSize(selectedFile.size)} •{" "}
                        {getFileTypeInfo()?.description}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedFile(null);
                        setFileType(null);
                        setOutputFormat(null);
                      }}
                      className="mt-4">
                      Change File
                    </Button>
                  </div>
                )}
              </div>

              {validationError && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{validationError}</AlertDescription>
                </Alert>
              )}

              {selectedFile && fileType && (
                <div className="mt-6 space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Convert to
                      </label>
                      <Select
                        value={outputFormat || undefined}
                        onValueChange={(value: OutputFormat) =>
                          setOutputFormat(value)
                        }>
                        <SelectTrigger>
                          <SelectValue placeholder="Select output format" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAllowedOutputFormats().map((format) => (
                            <SelectItem key={format} value={format}>
                              {format.toUpperCase()} Format
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Conversion Quality
                      </label>
                      <Select
                        value={quality}
                        onValueChange={(value: ConversionQuality) =>
                          setQuality(value)
                        }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fast">
                            Quick (Lower Quality)
                          </SelectItem>
                          <SelectItem value="balanced">Balanced</SelectItem>
                          <SelectItem value="high">High Quality</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button
                    onClick={simulateConversion}
                    disabled={!selectedFile || !outputFormat || isConverting}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                    {isConverting ? (
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Converting...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <FileDown className="h-4 w-4" />
                        Convert File
                      </div>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Conversion History */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-gray-800">
                Conversion History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {convertedFiles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No recent conversions</p>
                  <p className="text-sm mt-2">
                    Your converted files will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {convertedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="border rounded-lg p-4 bg-white shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <p className="font-medium">{file.originalName}</p>
                          <p className="text-xs text-gray-500">
                            Converted to {file.outputFormat.toUpperCase()}
                          </p>
                        </div>
                        {file.status === "completed" ? (
                          <CheckCircle2 className="text-green-500 h-5 w-5" />
                        ) : file.status === "failed" ? (
                          <XCircle className="text-red-500 h-5 w-5" />
                        ) : (
                          <RefreshCw className="text-blue-500 h-5 w-5 animate-spin" />
                        )}
                      </div>
                      {file.status === "converting" && (
                        <Progress value={file.progress} className="h-2 mt-2" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReformatConverter;
