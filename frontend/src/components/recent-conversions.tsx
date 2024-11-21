import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FILE_TYPE_CONFIGS } from "@/lib/config";
import { ConvertedFile } from "@/lib/types";
import { CheckCircle2, RefreshCw, XCircle } from "lucide-react";

interface Props {
  convertedFiles: ConvertedFile[];
}

export default function RecentConversions({ convertedFiles }: Props) {
  return (
    <Card className="mt-8">
      <CardContent className="p-6">
        <h2 className="text-2xl font-semibold mb-4 text-teal-800">
          Recent Conversions
        </h2>
        {convertedFiles.length === 0 ? (
          <div className="text-center py-8 text-teal-600">
            <p className="text-xl mb-2">No recent conversions</p>
            <p className="text-sm">Your converted files will appear here</p>
          </div>
        ) : (
          <ScrollArea className="h-[200px]">
            <div className="space-y-4">
              {convertedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 bg-teal-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">
                      {FILE_TYPE_CONFIGS[
                        file.originalType as keyof typeof FILE_TYPE_CONFIGS
                      ]?.icon || "📄"}
                    </div>
                    <div>
                      <p className="font-medium text-teal-800">
                        {file.originalName}
                      </p>
                      <p className="text-sm text-teal-600">
                        Converted to {file.outputFormat.toUpperCase()} •{" "}
                        {file.size}
                      </p>
                    </div>
                  </div>
                  {file.status === "completed" ? (
                    <CheckCircle2 className="text-teal-500 h-6 w-6" />
                  ) : file.status === "failed" ? (
                    <XCircle className="text-red-500 h-6 w-6" />
                  ) : (
                    <RefreshCw className="text-teal-500 h-6 w-6 animate-spin" />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
