import React from "react";
import { useFileConvert } from "@/hooks/useFileConvert";
import { RefreshCw } from "lucide-react";

export default function Loading({
  setCurrentStep,
}: {
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
}) {
  const { isPending } = useFileConvert();

  // If not pending anymore, move to next step
  if (!isPending) {
    setCurrentStep(3);
    return null;
  }

  return (
    <div className="text-center">
      <RefreshCw className="h-16 w-16 animate-spin text-teal-500 mx-auto mb-4" />
      <p className="text-xl font-semibold mb-2 text-teal-800">
        Converting your file...
      </p>
      <p className="text-teal-600 mb-4">This may take a few moments</p>
    </div>
  );
}
