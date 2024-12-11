import { useMutation } from "@tanstack/react-query";

export const useFileUploadMutation = () => {
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return fetch(`${process.env.API_URL}/upload`, {
        method: "POST",
        body: formData,
      });
    },
  });
};
