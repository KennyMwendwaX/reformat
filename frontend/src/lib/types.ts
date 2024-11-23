export type FileStatus =
  | "idle"
  | "uploading"
  | "converting"
  | "completed"
  | "failed";
export type OutputFormat = "pdf" | "docx" | "jpg" | "jpeg" | "png" | "gif";
export type ConversionQuality = "fast" | "balanced" | "high";

export interface ConvertedFile {
  id: string;
  originalName: string;
  originalType: string;
  outputFormat: OutputFormat;
  status: FileStatus;
  progress: number;
  size: string;
  convertedAt: Date;
}
