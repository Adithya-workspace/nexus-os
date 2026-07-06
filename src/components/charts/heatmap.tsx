"use client";

import { cn } from "@/lib/utils";

interface HeatmapCell {
  label: string;
  value: number; // 0-100
}

function cellColor(value: number): string {
  if (value >= 75) return "bg-emerald-500/70";
  if (value >= 55) return "bg-emerald-500/35";
  if (value >= 40) return "bg-amber-500/40";
  if (value >= 20) return "bg-orange-500/45";
  return "bg-red-500/55";
}

export function Heatmap({ cells }: { cells: HeatmapCell[] }) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
      {cells.map((cell) => (
        <div
          key={cell.label}
          className={cn("aspect-square rounded-xl flex flex-col items-center justify-center border border-white/10 transition-transform hover:scale-105", cellColor(cell.value))}
        >
          <span className="text-xs font-medium text-white/90">{cell.label}</span>
          <span className="text-lg font-bold text-white">{Math.round(cell.value)}</span>
        </div>
      ))}
    </div>
  );
}
