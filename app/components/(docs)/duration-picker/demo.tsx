"use client";

import { useState } from "react";
import {
  DurationPicker,
  type DurationPickerVariant,
  type DurationValue,
} from "@/components/ui/duration-picker";

const VARIANTS: {
  id: DurationPickerVariant;
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

export default function DurationPickerDemo() {
  const [value, setValue] = useState<DurationValue>({ hours: 1, minutes: 30 });
  const [variant, setVariant] = useState<DurationPickerVariant>("calamansi");
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

      {/*
        The box card, the same frame as the Dynamic Island and Gooey Nav demos: a
        min-height stage with a caption at the top, so the three read as one set.

        Two deliberate departures from the island's card. The fill is
        `bg-background`, not the island's tinted `bg-card/40`: the picker's tray is
        painted with `bg-border`, which is what the docs preview behind it is made
        of, so the card must be a colour the tray never is.

        And no `overflow-hidden`: the goo filter paints outside the component's box.
      */}
      <div className="relative flex min-h-[300px] w-full flex-col items-center justify-center rounded-3xl border border-border/70 bg-background p-6 sm:p-10">
        <p className="mb-4 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          Tap the pen to edit the duration
        </p>

        <DurationPicker
          value={value}
          onChange={setValue}
          variant={variant}
          size="sm"
        />
      </div>
    </div>
  );
}
