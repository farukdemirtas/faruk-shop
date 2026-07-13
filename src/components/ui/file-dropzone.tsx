"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Image as ImageIcon, FileText, AlertCircle } from "lucide-react";
import { cn, bytesToSize } from "@/lib/utils";

interface FileDropzoneProps {
  accept?: Record<string, string[]>;
  maxFiles?: number;
  maxSize?: number;
  onFilesAccepted: (files: File[]) => void;
  label?: string;
  hint?: string;
  className?: string;
}

export function FileDropzone({
  accept = {
    "image/*": [".png", ".jpg", ".jpeg", ".webp"],
  },
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024,
  onFilesAccepted,
  label = "Dosyaları buraya sürükleyin veya tıklayın",
  hint,
  className,
}: FileDropzoneProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const onDrop = useCallback((accepted: File[], rejected: { errors: ReadonlyArray<{ message: string }> }[]) => {
    setErrors([]);
    const newFiles = [...files, ...accepted].slice(0, maxFiles);
    setFiles(newFiles);
    onFilesAccepted(newFiles);

    if (rejected.length > 0) {
      const errMsgs = rejected.flatMap((r) => r.errors.map((e) => e.message));
      setErrors([...new Set(errMsgs)]);
    }
  }, [files, maxFiles, onFilesAccepted]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize,
  });

  function removeFile(index: number) {
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
    onFilesAccepted(updated);
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200",
          isDragActive
            ? "border-[#FF4FA3] bg-[#fff0f7]"
            : "border-gray-200 hover:border-[#FF4FA3] hover:bg-[#fff0f7]/50"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div className={cn(
            "w-14 h-14 rounded-xl flex items-center justify-center transition-colors",
            isDragActive ? "bg-[#FFD6E8]" : "bg-gray-100"
          )}>
            <Upload className={cn("w-7 h-7", isDragActive ? "text-[#FF4FA3]" : "text-gray-400")} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">{label}</p>
            {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
            <p className="text-xs text-gray-400 mt-1">
              Max {maxFiles} dosya • {bytesToSize(maxSize)} limit
            </p>
          </div>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="flex items-start gap-2 p-3 bg-red-50 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            {errors.map((err, i) => (
              <p key={i} className="text-xs text-red-600">{err}</p>
            ))}
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                {file.type.startsWith("image/") ? (
                  <ImageIcon className="w-5 h-5 text-[#FF4FA3]" />
                ) : (
                  <FileText className="w-5 h-5 text-blue-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
                <p className="text-xs text-gray-400">{bytesToSize(file.size)}</p>
              </div>
              <button
                onClick={() => removeFile(i)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface ImagePreviewGridProps {
  images: Array<{ url: string; name?: string }>;
  onRemove?: (index: number) => void;
}

export function ImagePreviewGrid({ images, onRemove }: ImagePreviewGridProps) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {images.map((img, i) => (
        <div key={i} className="relative group aspect-square">
          <img
            src={img.url}
            alt={img.name ?? `Görsel ${i + 1}`}
            className="w-full h-full object-cover rounded-xl border border-gray-200"
          />
          {onRemove && (
            <button
              onClick={() => onRemove(i)}
              className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
