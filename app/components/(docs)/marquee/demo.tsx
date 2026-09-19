"use client";

import { useState } from "react";
import { Marquee, type MarqueeVariant } from "@/components/ui/marquee";

const WORDS = ["Blink", "Pet", "Poke", "Blush"];

const COMPONENTS = [
  "Spotlight card",
  "Tilt card",
  "Dock",
  "Number ticker",
  "Marquee",
  "Calamansi mascot",
];

/** Swatches show the accent itself: the palette's deep tone into its bright one. */
const VARIANTS: {
  id: MarqueeVariant;
  label: string;
  gradient: string;
}[] = [
  {
    id: "white",
    label: "White",
    gradient: "linear-gradient(135deg, #ffffff 0%, #d4d4d8 100%)",
  },
  {
    id: "calamansi",
    label: "Calamansi",
    gradient: "linear-gradient(135deg, #5c7a67 0%, #b4e84c 100%)",
  },
  {
    id: "slate",
    label: "Slate Glass",
    gradient: "linear-gradient(135deg, #687396 0%, #a99fd6 100%)",
  },
  {
    id: "citrus",
    label: "Warm Citrus",
    gradient: "linear-gradient(135deg, #b87152 0%, #ffc93d 100%)",
  },
];

export default function MarqueeDemo() {
  const [variant, setVariant] = useState<MarqueeVariant>("calamansi");
  const currentVariant = VARIANTS.find((v) => v.id === variant) ?? VARIANTS[0];

  return (
    <div className="flex h-full w-full flex-col justify-center gap-6 p-4 sm:gap-8 sm:p-6">
      {/* Color Swatches Control */}
      <div className="flex items-center gap-3 self-center rounded-2xl border border-border/70 bg-card/60 px-3.5 py-2 shadow-2xs backdrop-blur-xs">
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

      {/* The display row tints from the palette accent the marquee carries */}
      <Marquee variant={variant} duration={26} gap={31}>
        {WORDS.map((word, index) => (
          <span
            key={word}
            className={`shrink-0 font-runde text-3xl font-bold tracking-tight sm:text-5xl ${
              index % 2 === 1 ? "opacity-45" : ""
            }`}
          >
            {word}
          </span>
        ))}
      </Marquee>

      {/* Chips take the same accent through currentColor */}
      <Marquee variant={variant} duration={38} gap={12} reverse>
        {COMPONENTS.map((name) => (
          <span
            key={name}
            className="shrink-0 rounded-full bg-current/10 px-4 py-1.5 text-sm font-medium whitespace-nowrap ring-1 ring-current/20"
          >
            {name}
          </span>
        ))}
      </Marquee>

      <Marquee
        variant={variant}
        duration={20}
        gap={20}
        fade={false}
        pauseOnHover={false}
      >
        {Array.from({ length: 6 }, (_, index) => (
          <span
            key={index}
            className="shrink-0 font-mono text-xs tracking-[0.24em] text-muted-foreground uppercase whitespace-nowrap"
          >
            no fade · no pause
          </span>
        ))}
      </Marquee>

      <p className="text-center text-xs font-medium text-muted-foreground">
        Hover a row to hold it in place. Move away and it carries on.
      </p>
    </div>
  );
}
