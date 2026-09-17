"use client";

import { useState } from "react";
import { Citrus, Leaf, Sun } from "lucide-react";
import {
  SpotlightCard,
  type SpotlightCardVariant,
} from "@/components/ui/spotlight-card";

const CARDS = [
  {
    title: "Rind",
    subtitle: "Glass edge tracking",
    body: "The border glow follows your pointer along the edge, however large you make it.",
    glow: "rgba(255, 255, 255, 0.9)",
    icon: <Leaf className="size-5" />,
    badge: "White Glow",
  },
  {
    title: "Flesh",
    subtitle: "Custom CSS token",
    body: "Pass any CSS colour and the border glow switches to it, token or literal.",
    glow: "rgba(180, 232, 76, 0.95)",
    icon: <Citrus className="size-5" />,
    badge: "Lime Glow",
  },
  {
    title: "Blush",
    subtitle: "Edge detection",
    body: "The border lights up only where your pointer actually reaches near the perimeter.",
    glow: "rgba(255, 201, 61, 0.95)",
    icon: <Sun className="size-5" />,
    badge: "Amber Glow",
  },
];

const VARIANTS: {
  id: SpotlightCardVariant;
  label: string;
  gradient: string;
}[] = [
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
  {
    id: "black",
    label: "Dark Black",
    gradient: "linear-gradient(135deg, #27272a 0%, #18181b 50%, #09090b 100%)",
  },
];

export default function SpotlightCardDemo() {
  const [variant, setVariant] = useState<SpotlightCardVariant>("calamansi");
  const currentVariant =
    VARIANTS.find((v) => v.id === variant) ?? VARIANTS[0];

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
                    : "opacity-80 ring-1 ring-white/20 hover:opacity-100"
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

      <div className="grid w-full max-w-4xl gap-4 sm:gap-5 md:grid-cols-3">
        {CARDS.map((card) => (
          <SpotlightCard
            key={card.title}
            color={card.glow}
            variant={variant}
            icon={card.icon}
            title={card.title}
            subtitle={card.subtitle}
            badge={
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-semibold text-white/90 backdrop-blur-xs">
                {card.badge}
              </span>
            }
          >
            <p className="text-sm font-medium leading-relaxed text-white/85">
              {card.body}
            </p>
          </SpotlightCard>
        ))}
      </div>

      <p className="max-w-md text-center text-xs font-medium text-muted-foreground">
        Move your pointer across a card: the border glow traces the perimeter of the glass window.
      </p>
    </div>
  );
}
