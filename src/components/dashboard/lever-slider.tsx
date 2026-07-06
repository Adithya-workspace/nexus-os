"use client";

import { Slider } from "@/components/ui/slider";
import { BusinessInputs } from "@/lib/simulation/types";
import { INPUT_BOUNDS } from "@/lib/simulation/constants";

interface LeverSliderProps {
  field: keyof BusinessInputs;
  value: number;
  onChange: (value: number) => void;
}

export function LeverSlider({ field, value, onChange }: LeverSliderProps) {
  const bounds = INPUT_BOUNDS[field];

  const displayValue = bounds.unit === "$" ? `$${value.toLocaleString()}` : `${value.toLocaleString()}${bounds.unit ? ` ${bounds.unit}` : ""}`;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground/90">{bounds.label}</label>
        <span className="text-sm font-semibold text-violet-300 tabular-nums">{displayValue}</span>
      </div>
      <Slider
        min={bounds.min}
        max={bounds.max}
        step={bounds.step}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
      />
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>{bounds.unit === "$" ? `$${bounds.min.toLocaleString()}` : bounds.min.toLocaleString()}</span>
        <span>{bounds.unit === "$" ? `$${bounds.max.toLocaleString()}` : bounds.max.toLocaleString()}</span>
      </div>
    </div>
  );
}
