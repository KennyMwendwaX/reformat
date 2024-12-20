export type FileStatus =
  | "idle"
  | "uploading"
  | "converting"
  | "completed"
  | "failed";
export type OutputFormat = "pdf" | "docx" | "jpg" | "jpeg" | "png" | "gif";
export type ConversionQuality = "fast" | "balanced" | "high";
