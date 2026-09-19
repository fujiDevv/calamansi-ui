"use client";

import { useState } from "react";
import { Minus, Plus, Shuffle } from "lucide-react";
import {
  NumberTicker,
  type NumberTickerVariant,
} from "@/components/ui/number-ticker";

const PRESETS = [12847, 3620, 981, 40215];

const VARIANTS: {
  id: NumberTickerVariant;
  label: string;
  gradient: string;
}[] = [
  {
    id: "white",
    label: "White",
    gradient: "linear-gradient(135deg, #ffffff 0%, #e9e9ec 50%, #d4d4d8 100%)",
  },
  {
    id: "calamansi",
    label: "Calamansi",
    gradient: "linear-gradient(135deg, #8fa37d 0%, #5c7a67 50%, #39564a 100%)",
  },
  {
    id: "slate",
    label: "Slate Glass",
    gradient: "linear-gradient(135deg, #a79cb7 0%, #687396 50%, #4a5a7f 100%)",
  },
  {
    id: "citrus",
    label: "Warm Citrus",
    gradient: "linear-gradient(135deg, #d69f7e 0%, #b87152 50%, #7d4128 100%)",
  },
];

const BUTTON =
  "inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-border/70 bg-card px-3.5 text-xs font-semibold text-foreground/80 transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default function NumberTickerDemo() {
  const [value, setValue] = useState(12847);
  const [variant, setVariant] = useState<NumberTickerVariant>("calamansi");
  const currentVariant = VARIANTS.find((v) => v.id === variant) ?? VARIANTS[0];

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-4 sm:gap-8 sm:p-6">
      {/* Color Swatches Control */}
      <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card/60 px-3.5 py-2 shadow-2xs backdrop-blur-xs">
        <span className="text-xs font-medium text-muted-foreground">
          Palette
        </span>

        <div className="flex items-center gap-2">
          {VARIANTS.map((option) => {
            const selected = variant === option.id;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setVariant(option.id)}
                aria-label={`Set color to ${option.label}`}
                aria-pressed={selected}
                title={option.label}
                className={`relative size-7 cursor-pointer rounded-xl transition-all duration-200 hover:scale-105 sm:size-8 ${
                  selected
                    ? "scale-110 shadow-md ring-2 ring-primary ring-offset-2 ring-offset-background"
                    : "opacity-80 ring-1 ring-foreground/10 hover:opacity-100"
                }`}
                style={{ background: option.gradient }}
              />
            );
          })}
        </div>

        <span className="min-w-[84px] text-xs font-semibold text-foreground transition-colors">
          {currentVariant.label}
        </span>
      </div>

      <div className="flex flex-col items-center">
        <NumberTicker
          value={value}
          variant={variant}
          className="text-2xl font-semibold tracking-tight sm:text-5xl"
        />
        <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          Kalansing
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          className={BUTTON}
          onClick={() => setValue((current) => Math.max(0, current - 275))}
        >
          <Minus className="size-3.5" />
          275
        </button>
        <button
          type="button"
          className={BUTTON}
          onClick={() => setValue((current) => current + 275)}
        >
          <Plus className="size-3.5" />
          275
        </button>
        <button
          type="button"
          className={BUTTON}
          onClick={() =>
            setValue(
              PRESETS[Math.floor(Math.random() * PRESETS.length)] ?? PRESETS[0],
            )
          }
        >
          <Shuffle className="size-3.5" />
          Shuffle
        </button>
      </div>
    </div>
  );
}
