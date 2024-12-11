import { useMutation } from "@tanstack/react-query";
import { OutputFormat } from "./types";

export const useFileUploadMutation = () => {
  return useMutation({
    mutationFn: ({
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
      return fetch(
        `${process.env.NEXT_PUBLIC_API_URL}?from=${fileType}&to=${outputFormat}`,
        {
          method: "POST",
          body: formData,
        }
      );
    },
  });
};
