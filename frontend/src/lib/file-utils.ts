export const getFileTypeFromExtension = (fileName: string): string => {
  const extension = fileName.split(".").pop()?.toLowerCase();
  const extensionMimeMap: { [key: string]: string } = {
    pdf: "application/pdf",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
  };
  return extension ? extensionMimeMap[extension] || "" : "";
};

export const formatFileSize = (bytes: number): string => {
  const units = ["Bytes", "KB", "MB", "GB"];
  if (bytes === 0) return "0 Bytes";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${units[i]}`;
};
