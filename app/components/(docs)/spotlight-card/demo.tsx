"use client";

import { Citrus, Leaf, Sparkles } from "lucide-react";
import { SpotlightCard } from "@/components/ui/spotlight-card";

const CARDS = [
  {
    title: "Rind",
    body: "The glow follows your pointer across the card, however large you make it.",
    glow: "color-mix(in oklab, var(--primary) 55%, transparent)",
    icon: <Leaf className="size-4" />,
  },
  {
    title: "Flesh",
    body: "Pass any CSS colour and the spotlight switches to it, token or literal.",
    glow: "color-mix(in oklab, var(--accent) 60%, transparent)",
    icon: <Citrus className="size-4" />,
  },
  {
    title: "Blush",
    body: "The border only lights up where the spotlight actually reaches it.",
    glow: "color-mix(in oklab, var(--calamansi-blush) 50%, transparent)",
    icon: <Sparkles className="size-4" />,
  },
];

export default function SpotlightCardDemo() {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="grid w-full max-w-4xl gap-4 md:grid-cols-3">
        {CARDS.map((card) => (
          <SpotlightCard
            key={card.title}
            color={card.glow}
            className="min-h-[200px]"
          >
            <span className="inline-flex size-8 items-center justify-center rounded-full bg-muted text-foreground/70">
              {card.icon}
            </span>
            <h3 className="mt-4 font-runde text-lg font-semibold tracking-tight">
              {card.title}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {card.body}
            </p>
          </SpotlightCard>
        ))}
      </div>
    </div>
  );
}
