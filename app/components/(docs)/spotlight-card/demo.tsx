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

const VARIANTS: { id: SpotlightCardVariant; label: string }[] = [
  { id: "calamansi", label: "Calamansi" },
  { id: "slate", label: "Slate Glass" },
  { id: "citrus", label: "Warm Citrus" },
];

export default function SpotlightCardDemo() {
  const [variant, setVariant] = useState<SpotlightCardVariant>("calamansi");

  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 p-3 sm:gap-7 sm:p-6">
      {/* Colour changer */}
      <div className="flex items-center rounded-full border border-border/70 bg-card/60 p-1 shadow-2xs backdrop-blur-xs">
        {VARIANTS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setVariant(option.id)}
            className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
              variant === option.id
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {option.label}
          </button>
        ))}
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
