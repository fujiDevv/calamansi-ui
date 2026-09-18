"use client";

import { useState } from "react";
import { BookOpen, Home, Layers, Sparkles } from "lucide-react";
import {
  GooeyNav,
  type GooeyNavItem,
  type GooeyNavVariant,
} from "@/components/ui/gooey-nav";

const VARIANTS: {
  id: GooeyNavVariant;
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

/** The icons carry no size: each size preset sets them from the labels. */
const ITEMS: GooeyNavItem[] = [
  { label: "Home", icon: <Home /> },
  { label: "Components", icon: <Layers /> },
  { label: "Templates", icon: <Sparkles /> },
  { label: "Docs", icon: <BookOpen /> },
];

export default function GooeyNavDemo() {
  const [active, setActive] = useState(1);
  const [variant, setVariant] = useState<GooeyNavVariant>("calamansi");
  const currentVariant = VARIANTS.find((v) => v.id === variant) ?? VARIANTS[0];

  return (
    <div className="flex w-full flex-col items-center gap-5 px-1 py-3 sm:gap-6 sm:py-4">
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

      {/* Main Interactive Component */}
      <div className="flex w-full justify-center p-3 sm:p-4">
        <GooeyNav
          items={ITEMS}
          value={active}
          onChange={setActive}
          variant={variant}
        />
      </div>
    </div>
  );
}
