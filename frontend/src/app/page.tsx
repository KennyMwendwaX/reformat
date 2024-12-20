"use client";

import React, { useState } from "react";
import {
  FileDown,
  Upload,
  RefreshCw,
  CheckCircle2,
  Settings,
  AlertCircle,
  Boxes,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { Toaster } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion, AnimatePresence } from "motion/react";
import { ConversionQuality, OutputFormat } from "@/lib/types";
import UploadArea from "@/components/upload-area";
import ConversionConfig from "@/components/conversion-config";
import Loading from "@/components/loading";

export default function ReformatConverter() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [outputFormat, setOutputFormat] = useState<OutputFormat | null>(null);
  const [quality, setQuality] = useState<ConversionQuality>("balanced");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [downloadInfo, setDownloadInfo] = useState<{
    url: string;
    filename: string;
  } | null>(null);

  const handleDownload = () => {
    if (downloadInfo) {
      const link = document.createElement("a");
      link.href = downloadInfo.url;
      link.download = downloadInfo.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL object
      window.URL.revokeObjectURL(downloadInfo.url);
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
    <div className="min-h-screen bg-gradient-to-br from-teal-100 via-white to-mint-100 text-teal-900 p-6 md:p-8">
      <Toaster richColors />
      <div className="max-w-4xl mx-auto">
        <header className="relative text-center py-4 px-4">
          {/* Logo and title container */}
          <div className="flex items-center justify-center gap-4 mb-2">
            {/* Icon container */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-teal-500 to-purple-500 rounded-lg rotate-6 scale-105 opacity-70" />
              <div className="relative flex items-center justify-center p-3 bg-white rounded-lg shadow-md">
                <Boxes className="h-9 w-9 text-teal-600" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent">
              Reformat
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-lg text-gray-600">
            Transform your files instantly with our intelligent conversion
            engine
          </p>
        </header>

        <Card className="shadow-0">
          <CardHeader className="px-4">
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
          </CardHeader>
          <CardContent>
            {validationError && (
              <Alert
                variant="destructive"
                className="mt-2 px-4 bg-red-50 border-red-200 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            )}

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
                    validationError={validationError}
                    setFileType={setFileType}
                    setSelectedFile={setSelectedFile}
                    setCurrentStep={setCurrentStep}
                    setOutputFormat={setOutputFormat}
                    setValidationError={setValidationError}
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
                    setDownloadInfo={setDownloadInfo}
                    setCurrentStep={setCurrentStep}
                  />
                )}

                {currentStep === 2 && (
                  <Loading setCurrentStep={setCurrentStep} />
                )}

                {currentStep === 3 && (
                  <div className="text-center">
                    <CheckCircle2 className="h-16 w-16 text-teal-500 mx-auto mb-4" />
                    <p className="text-xl font-semibold mb-2 text-teal-800">
                      Conversion Complete!
                    </p>
                    <p className="text-teal-600 mb-6">
                      Your file is ready for download
                    </p>
                    <div className="flex justify-center space-x-4">
                      <Button
                        className="bg-teal-500 hover:bg-teal-600 text-white"
                        onClick={handleDownload}>
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
          </CardContent>
        </Card>
        {/* <RecentConversions convertedFiles={convertedFiles} /> */}
      </div>
    </div>
  );
}
