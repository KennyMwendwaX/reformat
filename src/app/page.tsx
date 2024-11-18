"use client";

import React, { useState, useCallback } from "react";
import {
  Upload,
  FileUp,
  Check,
  AlertCircle,
  Trash2,
  Settings2,
  Info,
  FileIcon,
  ArrowRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

// Define types
interface RecentFile {
  name: string;
  status: "completed" | "failed";
  date: string;
}

type QualityOption = "low" | "medium" | "high";
type OutputFormat = "pdf" | "docx" | "jpg" | "png" | "svg" | "gif";

const FileConverter: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [converting, setConverting] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [outputFormat, setOutputFormat] = useState<OutputFormat | "">("");
  const [progress, setProgress] = useState<number>(0);
  const [quality, setQuality] = useState<QualityOption>("high");
  const [preserveMetadata, setPreserveMetadata] = useState<boolean>(true);
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([
    { name: "document.pdf", status: "completed", date: "2024-03-15" },
    { name: "image.jpg", status: "failed", date: "2024-03-14" },
  ]);

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

  const handleConvert = async () => {
    if (!file || !outputFormat) {
      setError("Please select both a file and output format");
      return;
    }

    setConverting(true);
    setError("");

    try {
      // Simulated conversion progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        setProgress(i);
      }
      setSuccess(true);
      setRecentFiles((prev) => [
        {
          name: file.name,
          status: "completed",
          date: new Date().toISOString().split("T")[0],
        },
        ...prev,
      ]);
    } catch (error) {
      console.log(error);
      setError("Error converting file. Please try again.");
    } finally {
      setConverting(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Universal File Converter
          </h1>
          <p className="text-gray-600">
            Convert any file format with advanced customization options
          </p>
        </div>

        <Tabs defaultValue="convert" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="convert">Convert Files</TabsTrigger>
            <TabsTrigger value="history">Recent Conversions</TabsTrigger>
          </TabsList>

          <TabsContent value="convert">
            <Card className="w-full">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-2xl font-bold">
                      File Converter
                    </CardTitle>
                    <CardDescription>
                      Support for 50+ file formats with custom settings
                    </CardDescription>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-5 w-5 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Maximum file size: 2GB</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* File Upload Area */}
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 transition-colors duration-200 ${
                      file
                        ? "border-blue-400 bg-blue-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}>
                    <input
                      type="file"
                      className="hidden"
                      id="file-upload"
                      onChange={handleFileChange}
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <div className="flex flex-col items-center">
                        {file ? (
                          <>
                            <FileIcon className="h-12 w-12 text-blue-500 mb-4" />
                            <div className="space-y-2 text-center">
                              <p className="text-sm font-medium text-gray-900">
                                {file.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(file.size)}
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setFile(null);
                                }}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove
                              </Button>
                            </div>
                          </>
                        ) : (
                          <>
                            <Upload className="h-12 w-12 text-gray-400 mb-4" />
                            <div className="space-y-2 text-center">
                              <p className="text-sm font-medium text-gray-900">
                                Drop your file here, or click to browse
                              </p>
                              <p className="text-xs text-gray-500">
                                Supports all major file formats
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </label>
                  </div>

                  {/* Conversion Options */}
                  {file && (
                    <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Output Format
                          </label>
                          <Select
                            onValueChange={(value: OutputFormat) =>
                              setOutputFormat(value)
                            }>
                            <SelectTrigger>
                              <SelectValue placeholder="Select format" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pdf">PDF</SelectItem>
                              <SelectItem value="docx">DOCX</SelectItem>
                              <SelectItem value="jpg">JPG</SelectItem>
                              <SelectItem value="png">PNG</SelectItem>
                              <SelectItem value="svg">SVG</SelectItem>
                              <SelectItem value="gif">GIF</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Quality</label>
                          <Select
                            value={quality}
                            onValueChange={(value: QualityOption) =>
                              setQuality(value)
                            }>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low (Faster)</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">
                                High (Slower)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={preserveMetadata}
                            onCheckedChange={setPreserveMetadata}
                          />
                          <label className="text-sm font-medium">
                            Preserve metadata
                          </label>
                        </div>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Button variant="ghost" size="icon">
                                <Settings2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Advanced settings</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  )}

                  {/* Convert Button and Progress */}
                  <div className="space-y-4">
                    <Button
                      onClick={handleConvert}
                      disabled={!file || converting || !outputFormat}
                      className="w-full h-12">
                      {converting ? (
                        <span className="flex items-center">
                          Converting...
                          <FileUp className="ml-2 h-4 w-4 animate-spin" />
                        </span>
                      ) : (
                        <span className="flex items-center">
                          Convert File
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </span>
                      )}
                    </Button>

                    {converting && (
                      <div className="space-y-2">
                        <Progress value={progress} className="h-2" />
                        <p className="text-sm text-gray-500 text-center">
                          {progress}% complete
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Success Message */}
                  {success && (
                    <Alert className="bg-green-50 border-green-200">
                      <Check className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-600">
                        File converted successfully! Click here to download.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Error Message */}
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Recent Conversions</CardTitle>
                <CardDescription>
                  History of your file conversions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentFiles.map((recentFile, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-white rounded-lg border">
                      <div className="flex items-center space-x-4">
                        <FileIcon className="h-8 w-8 text-gray-400" />
                        <div>
                          <p className="font-medium">{recentFile.name}</p>
                          <p className="text-sm text-gray-500">
                            {recentFile.date}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          recentFile.status === "completed"
                            ? "default"
                            : "destructive"
                        }>
                        {recentFile.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FileConverter;
