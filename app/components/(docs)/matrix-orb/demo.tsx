"use client";

import { useState, type ReactNode } from "react";
import { AudioLines, Brain, Moon } from "lucide-react";
import {
  MatrixOrb,
  type MatrixOrbState,
  type MatrixOrbVariant,
} from "@/components/ui/matrix-orb";

const STATES: { id: MatrixOrbState; label: string; icon: ReactNode }[] = [
  { id: "idle", label: "Idle", icon: <Moon className="size-3.5" /> },
  {
    id: "listening",
    label: "Listening",
    icon: <AudioLines className="size-3.5" />,
  },
  { id: "thinking", label: "Thinking", icon: <Brain className="size-3.5" /> },
];

const VARIANTS: {
  id: MatrixOrbVariant;
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

const SIZES = [180, 240, 320] as const;
const DOTS = [9, 11, 15] as const;

const BUTTON =
  "inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-border/70 bg-card px-3.5 text-xs font-semibold text-foreground/80 transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** Steps a value through its presets, so the control is one button, not a slider. */
function nextPreset<T>(value: T, presets: readonly T[]) {
  const index = presets.indexOf(value);
  return presets[(index + 1) % presets.length] ?? presets[0];
}

export default function MatrixOrbDemo() {
  const [state, setState] = useState<MatrixOrbState>("listening");
  const [variant, setVariant] = useState<MatrixOrbVariant>("calamansi");
  const [size, setSize] = useState<number>(240);
  const [dots, setDots] = useState<number>(11);
  const currentVariant = VARIANTS.find((v) => v.id === variant) ?? VARIANTS[0];

  return (
    <div className="flex w-full flex-col items-center gap-5 px-1 py-3 sm:gap-6 sm:py-4">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-center gap-3">
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

        {/* State Control */}
        <div className="flex items-center gap-1 rounded-full border border-border/70 bg-card/60 p-1 shadow-2xs backdrop-blur-xs">
          {STATES.map((option) => {
            const selected = state === option.id;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setState(option.id)}
                aria-pressed={selected}
                className={`inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-colors ${
                  selected
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {option.icon}
                {option.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className={BUTTON}
          onClick={() => setSize((current) => nextPreset(current, SIZES))}
        >
          Size: {size}
        </button>

        <button
          type="button"
          className={BUTTON}
          onClick={() => setDots((current) => nextPreset(current, DOTS))}
        >
          Dots: {dots}
        </button>
      </div>

      {/* Main Interactive Component */}
      <div className="flex w-full justify-center p-3 sm:p-4">
        <MatrixOrb
          state={state}
          variant={variant}
          size={size}
          dots={dots}
          labels={{
            idle: "Idle",
            listening: "Listening",
            thinking: "Thinking",
          }}
        />
      </div>

      {/* The three states side by side, so the motion reads without switching */}
      <div className="flex flex-wrap items-end justify-center gap-4 sm:gap-6">
        {STATES.map((option) => (
          <MatrixOrb
            key={option.id}
            state={option.id}
            variant={variant}
            size={112}
            dots={9}
          />
        ))}
      </div>

      <p className="max-w-md text-center text-xs text-muted-foreground">
        Idle breathes, listening ripples outward and thinking runs three heat
        sources around the sphere. Switching state mid-pulse blends from what is
        on screen instead of restarting.
      </p>
    </div>
  );
}
