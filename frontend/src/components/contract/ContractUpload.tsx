"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ContractUploadProps {
  onUpload: (file: File) => void;
  isLoading?: boolean;
  accept?: string;
}

export function ContractUpload({
  onUpload,
  isLoading = false,
  accept = ".pdf,.docx,.doc,.txt",
}: ContractUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) {
        setSelectedFile(file);
      }
    },
    []
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleUpload = () => {
    if (selectedFile) onUpload(selectedFile);
  };

  return (
    <div className="space-y-3">
      <label
        className={cn(
          "block border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
          dragOver
            ? "border-blue-500 bg-blue-500/10"
            : "border-slate-700 hover:border-slate-600 bg-slate-800/50"
        )}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="hidden"
          accept={accept}
          onChange={handleFileChange}
          disabled={isLoading}
        />
        <div className="flex flex-col items-center gap-3">
          {isLoading ? (
            <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
          ) : (
            <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center">
              <Upload className="w-6 h-6 text-blue-400" />
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-white">
              {isLoading ? "Analyzing contract..." : "Drop your contract here"}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              PDF, DOCX, or TXT • Max 50MB
            </p>
          </div>
          {!isLoading && (
            <span className="text-xs text-blue-400 font-medium">
              or click to browse
            </span>
          )}
        </div>
      </label>

      {selectedFile && !isLoading && (
        <div className="flex items-center gap-3 bg-slate-800 rounded-lg p-3">
          <FileText className="w-4 h-4 text-blue-400 shrink-0" />
          <span className="text-sm text-slate-200 flex-1 truncate">
            {selectedFile.name}
          </span>
          <span className="text-xs text-slate-500">
            {(selectedFile.size / 1024 / 1024).toFixed(1)}MB
          </span>
          <button
            onClick={() => setSelectedFile(null)}
            className="text-slate-500 hover:text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {selectedFile && !isLoading && (
        <Button
          onClick={handleUpload}
          className="w-full"
          size="lg"
        >
          <Upload className="w-4 h-4" />
          Analyze Contract
        </Button>
      )}
    </div>
  );
}
