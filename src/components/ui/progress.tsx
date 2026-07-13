"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercent?: boolean;
  color?: "pink" | "green" | "blue" | "orange";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const colorMap = {
  pink: "bg-[#FF4FA3]",
  green: "bg-green-500",
  blue: "bg-blue-500",
  orange: "bg-orange-500",
};

const sizeMap = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercent = false,
  color = "pink",
  size = "md",
  className,
}: ProgressBarProps) {
  const percent = Math.min(Math.round((value / max) * 100), 100);

  return (
    <div className={cn("w-full", className)}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-sm text-gray-600">{label}</span>}
          {showPercent && <span className="text-sm font-medium text-gray-900">{percent}%</span>}
        </div>
      )}
      <div className={cn("w-full bg-gray-100 rounded-full overflow-hidden", sizeMap[size])}>
        <div
          className={cn("h-full rounded-full transition-all duration-500 ease-out", colorMap[color])}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

interface SyncProgressProps {
  total: number;
  success: number;
  failed: number;
  isRunning: boolean;
}

export function SyncProgress({ total, success, failed, isRunning }: SyncProgressProps) {
  const processed = success + failed;
  const percent = total > 0 ? Math.round((processed / total) * 100) : 0;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">
          {isRunning ? "Senkronizasyon devam ediyor..." : "Senkronizasyon tamamlandı"}
        </span>
        <span className="text-sm text-gray-500">{processed} / {total}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
        <div className="h-full flex">
          <div
            className="bg-green-500 transition-all duration-300"
            style={{ width: `${total > 0 ? (success / total) * 100 : 0}%` }}
          />
          <div
            className="bg-red-400 transition-all duration-300"
            style={{ width: `${total > 0 ? (failed / total) * 100 : 0}%` }}
          />
        </div>
      </div>
      <div className="flex gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          Başarılı: {success}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-400" />
          Başarısız: {failed}
        </span>
        {isRunning && (
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-gray-300 animate-pulse" />
            Bekleyen: {total - processed}
          </span>
        )}
      </div>
    </div>
  );
}
