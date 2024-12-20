import { useMutation } from "@tanstack/react-query";
import { OutputFormat } from "./types";

export const useFileUploadMutation = () => {
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
        throw new Error('File conversion failed');
      }

      // Get the blob from the response
      const blob = await response.blob();
      
      // Create a download URL for the file
      const downloadUrl = window.URL.createObjectURL(blob);
      
      return {
        blob,
        downloadUrl,
        filename: outputFormat ? `converted.${outputFormat}` : 'converted_file'
      };
    },
  });
};