import { useMutation } from "@tanstack/react-query";
import { OutputFormat } from "../lib/types";

export const useFileConvert = () => {
  return useMutation({
    mutationFn: async ({
      file,
      fileType,
      outputFormat,
    }: {
      file: File;
      fileType: string;
      outputFormat: OutputFormat | null;
    }) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}?from=${fileType}&to=${outputFormat}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Conversion failed");
      }

      // Get original filename without extension
      const originalName = file.name.split(".").slice(0, -1).join(".");

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);

      return {
        downloadUrl,
        filename: `${originalName}.${outputFormat}`, // Use original filename with new extension
      };
    },
  });
};
