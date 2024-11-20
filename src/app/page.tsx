"use client";

import React, { useState } from "react";
import {
  FileDown,
  Upload,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  Settings,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { Progress } from "@/components/ui/progress";
import { toast, Toaster } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion, AnimatePresence } from "motion/react";
import { ConversionQuality, ConvertedFile, OutputFormat } from "@/lib/types";
import { FILE_TYPE_CONFIGS } from "@/lib/config";
import RecentConversions from "@/components/recent-conversions";
import { formatFileSize, getFileTypeFromExtension } from "@/lib/file-utils";
import UploadArea from "@/components/upload-area";
import ConversionConfig from "@/components/conversion-config";

export default function ReformatConverter() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [outputFormat, setOutputFormat] = useState<OutputFormat | null>(null);
  const [quality, setQuality] = useState<ConversionQuality>("balanced");
  const [convertedFiles, setConvertedFiles] = useState<ConvertedFile[]>([]);
  const [, setIsConverting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

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
    const file = event.dataTransfer.files[0];
    if (file) {
      await processSelectedFile(file);
    }
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

  const simulateConversion = async () => {
    if (!selectedFile || !outputFormat || !fileType) {
      toast.error("Please select a file and output format");
      return;
    }

    setIsConverting(true);
    setCurrentStep(2);
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
      console.error(error);
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
      setCurrentStep(3);
    }
  };

  const resetConversion = () => {
    setSelectedFile(null);
    setFileType(null);
    setOutputFormat(null);
    setCurrentStep(0);
  };

  const steps = [
    { title: "Upload", icon: <Upload className="w-6 h-6" /> },
    { title: "Configure", icon: <Settings className="w-6 h-6" /> },
    { title: "Convert", icon: <RefreshCw className="w-6 h-6" /> },
    { title: "Download", icon: <FileDown className="w-6 h-6" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-mint-100 text-teal-900 p-6 md:p-8">
      <Toaster richColors />
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-teal-500 rounded-full mb-6">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-4 text-teal-800">Reformat</h1>
          <p className="text-xl text-teal-600 max-w-2xl mx-auto">
            Transform your files with our intelligent conversion tool
          </p>
        </header>

        <Card className="shadow-0">
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-6 border-b border-teal-100">
              {steps.map((step, index) => (
                <div key={step.title} className="flex flex-col items-center">
                  <div
                    className={`rounded-full p-3 ${
                      index === currentStep
                        ? "bg-teal-500 text-white"
                        : index < currentStep
                        ? "bg-teal-200 text-teal-700"
                        : "bg-gray-100 text-gray-400"
                    }`}>
                    {step.icon}
                  </div>
                  <span className="mt-2 text-sm font-medium">{step.title}</span>
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="p-6">
                {currentStep === 0 && (
                  <UploadArea
                    onFileSelect={handleFileSelect}
                    onFileDrop={handleFileDrop}
                  />
                )}

                {currentStep === 1 && selectedFile && fileType && (
                  <ConversionConfig
                    selectedFile={selectedFile}
                    fileType={fileType}
                    outputFormat={outputFormat}
                    quality={quality}
                    setOutputFormat={setOutputFormat}
                    setQuality={setQuality}
                    onConvert={simulateConversion}
                  />
                )}

                {currentStep === 2 && (
                  <div className="text-center">
                    <RefreshCw className="h-16 w-16 animate-spin text-teal-500 mx-auto mb-4" />
                    <p className="text-xl font-semibold mb-2 text-teal-800">
                      Converting your file...
                    </p>
                    <p className="text-teal-600 mb-4">
                      This may take a few moments
                    </p>
                    <Progress
                      value={convertedFiles[0]?.progress || 0}
                      className="h-2 w-full max-w-md mx-auto [&>*]:bg-teal-500"
                    />
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="text-center">
                    <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <p className="text-xl font-semibold mb-2 text-teal-800">
                      Conversion Complete!
                    </p>
                    <p className="text-teal-600 mb-6">
                      Your file is ready for download
                    </p>
                    <div className="flex justify-center space-x-4">
                      <Button className="bg-teal-500 hover:bg-teal-600 text-white">
                        Download Converted File
                      </Button>
                      <Button
                        variant="outline"
                        onClick={resetConversion}
                        className="hover:text-teal-500">
                        Convert Another File
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {validationError && (
              <Alert
                variant="destructive"
                className="m-6 bg-red-50 border-red-200 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
        <RecentConversions convertedFiles={convertedFiles} />
      </div>
    </div>
  );
}
