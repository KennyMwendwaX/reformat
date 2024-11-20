import { OutputFormat } from "./types";

export const FILE_TYPE_CONFIGS: Record<
  string,
  { icon: string; allowedOutputs: OutputFormat[]; description: string }
> = {
  "image/jpeg": {
    icon: "🖼️",
    allowedOutputs: ["pdf", "png", "jpg", "gif"],
    description: "JPEG Image",
  },
  "image/png": {
    icon: "🖼️",
    allowedOutputs: ["pdf", "jpg", "gif"],
    description: "PNG Image",
  },
  "image/gif": {
    icon: "🎭",
    allowedOutputs: ["jpg", "png", "pdf"],
    description: "GIF Animation",
  },
  "image/svg+xml": {
    icon: "📐",
    allowedOutputs: ["png", "jpg", "pdf"],
    description: "SVG Vector",
  },
  "application/pdf": {
    icon: "📄",
    allowedOutputs: ["docx", "jpg", "png"],
    description: "PDF Document",
  },
  "application/msword": {
    icon: "📝",
    allowedOutputs: ["pdf", "docx"],
    description: "Word Document",
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
    icon: "📝",
    allowedOutputs: ["pdf"],
    description: "Word Document",
  },
};
