"use client";

import React, { useState, useCallback } from "react";
import {
  Upload,
  FileUp,
  AlertCircle,
  Settings2,
  FileIcon,
  RefreshCw,
  Clock,
  FileDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

interface RecentFile {
  id: string;
  name: string;
  status: "completed" | "failed" | "processing";
  date: string;
  size: string;
  outputFormat: string;
}

type QualityOption = "low" | "medium" | "high";
type OutputFormat = "pdf" | "docx" | "jpg" | "png" | "svg" | "gif";

const FileConverter = () => {
  const [file, setFile] = useState<File | null>(null);
  const [converting, setConverting] = useState<boolean>(false);
  const [, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [outputFormat, setOutputFormat] = useState<OutputFormat | "">("");
  const [progress, setProgress] = useState<number>(0);
  const [quality, setQuality] = useState<QualityOption>("high");
  const [preserveMetadata, setPreserveMetadata] = useState<boolean>(true);
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        setFile(selectedFile);
        setError("");
        setSuccess(false);
        setProgress(0);
      }
    },
    []
  );

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setError("");
      setSuccess(false);
      setProgress(0);
    }
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleConvert = async () => {
    if (!file || !outputFormat) {
      setError("Please select both a file and output format");
      return;
    }

    setConverting(true);
    setError("");

    try {
      const newFile = {
        id: Date.now().toString(),
        name: file.name,
        status: "processing" as const,
        date: new Date().toISOString().split("T")[0],
        size: formatFileSize(file.size),
        outputFormat,
      };

      setRecentFiles((prev) => [newFile, ...prev]);

      for (let i = 0; i <= 100; i += 5) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        setProgress(i);
      }

      setSuccess(true);
      setRecentFiles((prev) => [
        {
          ...prev[0],
          status: "completed",
        },
        ...prev.slice(1),
      ]);
    } catch (error) {
      console.log(error);
      setError("Conversion failed. Please try again.");
      setRecentFiles((prev) => [
        {
          ...prev[0],
          status: "failed",
        },
        ...prev.slice(1),
      ]);
    } finally {
      setConverting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Modern Header */}
        <div className="text-center max-w-2xl mx-auto px-4 mb-8">
          <div className="flex flex-col items-center justify-center">
            <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mb-4 shadow-lg">
              <FileDown className="h-8 w-8 text-white" />
            </div>

            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Reformat
            </h1>

            <p className="mt-4 text-gray-600 text-lg">
              Convert files instantly and transform your files to any format
              with one click
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Main Converter Card */}
          <Card className="lg:col-span-3 border-0 shadow-xl bg-white/70 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">
                File Converter
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Upload Area */}
              <div
                className={`relative overflow-hidden rounded-xl transition-all duration-300 ${
                  file
                    ? "bg-indigo-50/50"
                    : "bg-gradient-to-br from-gray-50 to-gray-100 hover:from-indigo-50 hover:to-purple-50"
                }`}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}>
                <input
                  type="file"
                  className="hidden"
                  id="file-upload"
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="file-upload"
                  className="block cursor-pointer p-8 text-center">
                  {file ? (
                    <div className="space-y-4">
                      <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                        <FileIcon className="h-8 w-8 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {file.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          setFile(null);
                        }}
                        className="bg-white/80">
                        Choose Different File
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <Upload className="h-8 w-8 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Drop your file here, or click to browse
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Supports all major file formats
                        </p>
                      </div>
                    </div>
                  )}
                </label>
              </div>

              {/* Conversion Options */}
              {file && (
                <div className="mt-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Convert to
                      </label>
                      <Select
                        onValueChange={(value: OutputFormat) =>
                          setOutputFormat(value)
                        }>
                        <SelectTrigger>
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF Document</SelectItem>
                          <SelectItem value="docx">Word (DOCX)</SelectItem>
                          <SelectItem value="jpg">JPEG Image</SelectItem>
                          <SelectItem value="png">PNG Image</SelectItem>
                          <SelectItem value="svg">SVG Vector</SelectItem>
                          <SelectItem value="gif">GIF Animation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quality
                      </label>
                      <Select
                        value={quality}
                        onValueChange={(value: QualityOption) =>
                          setQuality(value)
                        }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">
                            Fast (Lower quality)
                          </SelectItem>
                          <SelectItem value="medium">Balanced</SelectItem>
                          <SelectItem value="high">Best (Slower)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={preserveMetadata}
                        onCheckedChange={setPreserveMetadata}
                      />
                      <span className="text-sm text-gray-600">
                        Keep original metadata
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" className="text-gray-500">
                      <Settings2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <Button
                    onClick={handleConvert}
                    disabled={!file || converting || !outputFormat}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                    {converting ? (
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Converting... {progress}%
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <FileUp className="h-4 w-4" />
                        Convert Now
                      </div>
                    )}
                  </Button>

                  {converting && <Progress value={progress} className="h-2" />}

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Conversions Card */}
          <Card className="lg:col-span-2 border-0 shadow-xl bg-white/70 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">
                Recent Files
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentFiles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-8 w-8 mx-auto mb-2" />
                  <p>No recent conversions</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                          <FileIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">{file.size}</p>
                        </div>
                      </div>
                      <Badge
                        className={`${
                          file.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : file.status === "processing"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                        {file.status}
                      </Badge>
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

export default FileConverter;
