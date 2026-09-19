"use client";

import { useState } from "react";
import { BookOpen, Home, Layers, Sparkles } from "lucide-react";
import {
  GooeyNav,
  GOOEY_NAV_PAINT,
  type GooeyNavItem,
  type GooeyNavVariant,
} from "@/components/ui/gooey-nav";

/*
  Labels only: the swatch paints itself from the component's own palette map, so what
  you click and what the pill wears are the same string rather than two copies of it.
*/
const VARIANTS: { id: GooeyNavVariant; label: string }[] = [
  { id: "white", label: "White" },
  { id: "calamansi", label: "Calamansi" },
  { id: "slate", label: "Slate Glass" },
  { id: "citrus", label: "Warm Citrus" },
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
                style={{ background: GOOEY_NAV_PAINT[option.id] }}
              />
            );
          })}
        </div>

        <span className="min-w-[84px] text-xs font-semibold text-foreground transition-colors">
          {currentVariant.label}
        </span>
      </div>

      {/*
        The box card, the same frame the Dynamic Island demo uses: a min-height
        stage with a caption at the top, so the three demos read as one set.

        Two deliberate departures from the island's card, both load-bearing.

        The fill is `bg-background` rather than the island's tinted `bg-card/40`:
        this component's tray is painted with `bg-border`, which is exactly what
        the docs preview behind it is made of, so the card has to be a colour the
        tray never is — and tinting lands right back on that grey.

        No `overflow-hidden` either: the goo filter paints outside the component's
        box, and a clip would slice the neck off mid-flight.
      */}
      <div className="relative flex min-h-[300px] w-full flex-col items-center justify-center rounded-3xl border border-border/70 bg-background p-6 sm:p-10">
        <p className="mb-4 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          Tap a tab to slide the goo
        </p>

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
