"use client";

import { useState } from "react";
import { Citrus, Leaf } from "lucide-react";
import {
  SpotlightCard,
  type SpotlightCardVariant,
} from "@/components/ui/spotlight-card";

const VARIANTS: {
  id: SpotlightCardVariant;
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

const CARDS = [
  {
    title: "Rind",
    subtitle: "The branded surface",
    body: "One flat surface, clipped to the Calamansi squircle — a superellipse, not a border radius.",
    icon: <Leaf className="size-5" />,
    badge: "Squircle",
  },
  {
    title: "Flesh",
    subtitle: "Reads in both themes",
    body: "White in light mode, near-black in dark, and each tinted palette carries the ink that sits on it.",
    icon: <Citrus className="size-5" />,
    badge: "Themed",
  },
];

export default function SpotlightCardDemo() {
  const [variant, setVariant] = useState<SpotlightCardVariant>("calamansi");
  const currentVariant = VARIANTS.find((v) => v.id === variant) ?? VARIANTS[0];

  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 p-3 sm:gap-7 sm:p-6">
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

      {/*
        Two cards, not three. The palette control above already demonstrates that
        the surface reads in both themes, and the caption below already covers
        cornerRadius — so the third card was restating what was on screen twice
        over. Two also sit better in a row than three did across the column.
      */}
      <div className="grid w-full max-w-3xl gap-4 sm:gap-5 md:grid-cols-2">
        {CARDS.map((card) => (
          <SpotlightCard
            key={card.title}
            variant={variant}
            icon={card.icon}
            title={card.title}
            subtitle={card.subtitle}
            badge={
              <span className="rounded-full bg-current/10 px-2.5 py-0.5 text-[10px] font-semibold text-current/70">
                {card.badge}
              </span>
            }
          >
            <p className="text-sm leading-relaxed font-medium text-current/85">
              {card.body}
            </p>
          </SpotlightCard>
        ))}
      </div>

      <p className="max-w-md text-center text-xs font-medium text-muted-foreground">
        Pick a palette — the surface stays flat and the corner stays the
        constant. Pass a different cornerRadius to tighten the curve.
      </p>
    </div>
  );
}
