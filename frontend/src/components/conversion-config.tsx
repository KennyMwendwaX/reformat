import React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Zap, Settings, Clock } from "lucide-react";
import { FILE_TYPE_CONFIGS } from "@/lib/config";
import { OutputFormat, ConversionQuality } from "@/lib/types";
import { formatFileSize } from "@/lib/file-utils";
import { useFileUploadMutation } from "@/lib/file-upload";
import { toast } from "sonner";

interface ConversionConfigProps {
  selectedFile: File;
  fileType: string;
  outputFormat: OutputFormat | null;
  quality: ConversionQuality;
  setOutputFormat: (format: OutputFormat) => void;
  setQuality: (quality: ConversionQuality) => void;
  onConvert: () => void;
}

export default function ConversionConfig({
  selectedFile,
  fileType,
  outputFormat,
  quality,
  setOutputFormat,
  setQuality,
}: ConversionConfigProps) {
  const { mutate } = useFileUploadMutation();

  const handleConvert = () => {
    mutate(
      { file: selectedFile, fileType, outputFormat },
      {
        onSuccess: () => {
          toast.success("File uploaded successfully!");
        },
        onError: (error) => {
          console.log(error);
          toast.error("Failed to upload the file.");
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="text-4xl">
          {FILE_TYPE_CONFIGS[fileType as keyof typeof FILE_TYPE_CONFIGS]
            ?.icon || "📄"}
        </div>
        <div>
          <p className="text-xl font-semibold text-teal-800">
            {selectedFile.name}
          </p>
          <p className="text-sm text-teal-600">
            {formatFileSize(selectedFile.size)} •{" "}
            {
              FILE_TYPE_CONFIGS[fileType as keyof typeof FILE_TYPE_CONFIGS]
                ?.description
            }
          </p>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-teal-700 mb-2">
            Convert to
          </label>
          <Select
            value={outputFormat || undefined}
            onValueChange={(value: OutputFormat) => setOutputFormat(value)}>
            <SelectTrigger className="w-full bg-white border-teal-200 text-teal-800">
              <SelectValue placeholder="Select output format" />
            </SelectTrigger>
            <SelectContent className="bg-white border-teal-200">
              {FILE_TYPE_CONFIGS[
                fileType as keyof typeof FILE_TYPE_CONFIGS
              ]?.allowedOutputs.map((format) => (
                <SelectItem
                  key={format}
                  value={format}
                  className="text-teal-800">
                  {format.toUpperCase()} Format
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium text-teal-700 mb-2">
            Conversion Quality
          </label>
          <Select
            value={quality}
            onValueChange={(value: ConversionQuality) => setQuality(value)}>
            <SelectTrigger className="w-full bg-white border-teal-200 text-teal-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-teal-200">
              <SelectItem value="fast" className="text-teal-800">
                <div className="flex items-center">
                  <Zap className="mr-2 h-4 w-4 text-yellow-500" />
                  Quick (Lower Quality)
                </div>
              </SelectItem>
              <SelectItem value="balanced" className="text-teal-800">
                <div className="flex items-center">
                  <Settings className="mr-2 h-4 w-4 text-teal-500" />
                  Balanced
                </div>
              </SelectItem>
              <SelectItem value="high" className="text-teal-800">
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-blue-500" />
                  High Quality
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button
        onClick={handleConvert}
        disabled={!outputFormat}
        className="w-full py-6 text-lg bg-teal-500 hover:bg-teal-600 text-white transition-colors duration-300">
        Start Conversion
      </Button>
    </div>
  );
}
