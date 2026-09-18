"use client";

import { useState } from "react";
import {
  MorningWidget,
  type MorningWidgetVariant,
  type MotivationQuote,
} from "@/components/ui/morning-widget";

/** The swatches mirror each palette's mesh: its blobs over its base. */
const VARIANTS: {
  id: MorningWidgetVariant;
  label: string;
  gradient: string;
}[] = [
  {
    id: "white",
    label: "White",
    gradient: "linear-gradient(135deg, #f5f5f6 0%, #dadbdf 50%, #c7c8cd 100%)",
  },
  {
    id: "calamansi",
    label: "Calamansi",
    gradient: "linear-gradient(135deg, #b4e84c 0%, #7d9c52 50%, #5c7a67 100%)",
  },
  {
    id: "slate",
    label: "Slate Glass",
    gradient: "linear-gradient(135deg, #a99fd6 0%, #8b84b4 50%, #5a6a9c 100%)",
  },
  {
    id: "citrus",
    label: "Warm Citrus",
    gradient: "linear-gradient(135deg, #ffc93d 0%, #fcaf58 50%, #ff8d8d 100%)",
  },
];

/**
 * The set the card reads from — the founder pack this demo has always opened on, kept
 * as plain data now that the pack switcher is gone.
 */
const QUOTES: MotivationQuote[] = [
  {
    text: "You have to start delegating tasks, now go carpe diem :)",
    emphasis: ["delegating tasks", "carpe diem"],
  },
  {
    text: "Ship it, then make it better. Momentum beats polish.",
    emphasis: ["Ship it", "Momentum"],
  },
  {
    text: "Small bets, compounding wins.",
    emphasis: ["compounding wins"],
  },
  {
    text: "Talk to users before you touch the pixels.",
    emphasis: ["Talk to users"],
  },
];

/**
 * The palette and the widget, and nothing else: the name field, the pack switcher, the
 * format and tilt toggles and the reset button that used to sit above it are gone. The
 * widget keeps its own defaults for everything they used to set — the greeting goes to
 * "Friend", the clock reads 12h, and the card still leans towards the pointer.
 */
export default function MorningWidgetDemo() {
  const [variant, setVariant] = useState<MorningWidgetVariant>("calamansi");
  const currentVariant = VARIANTS.find((v) => v.id === variant) ?? VARIANTS[0];

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 p-4 sm:gap-8 sm:p-10">
      <div className="flex flex-col items-center gap-1.5 text-center">
        <p className="font-runde text-lg font-semibold tracking-tight text-foreground">
          Morning motivation
        </p>
        <p className="max-w-sm text-xs text-muted-foreground">
          The clock ticks digit by digit, the card leans towards your pointer,
          and each line arrives in stages.
        </p>
      </div>

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

      <MorningWidget quotes={QUOTES} variant={variant} />

      <p className="max-w-md text-center text-xs font-medium text-muted-foreground">
        Click the card to skip to the next line. Hovering holds it so you can
        finish reading.
      </p>
    </div>
  );
}
