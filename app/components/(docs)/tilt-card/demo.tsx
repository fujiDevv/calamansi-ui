"use client";

import { useState } from "react";
import { Citrus, Layers } from "lucide-react";
import { TiltCard, type TiltCardVariant } from "@/components/ui/tilt-card";

const VARIANTS: {
  id: TiltCardVariant;
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

export default function TiltCardDemo() {
  const [variant, setVariant] = useState<TiltCardVariant>("calamansi");
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
        max-w-xl is as narrow as this grid goes: the cards are grid-sized, and
        their two-column value list ellipsizes rather than wraps — "reduced
        motion" measures 80px at text-xs/600, which the 576px grid just holds.
      */}
      <div className="grid w-full max-w-xl gap-5 sm:grid-cols-2 sm:gap-6">
        <TiltCard
          maxTilt={16}
          variant={variant}
          icon={<Citrus className="size-5" />}
          title="Rind"
          subtitle="maxTilt 16 · glare on"
          badge={
            <span className="rounded-full bg-current/15 px-2.5 py-0.5 text-[10px] font-semibold text-current ring-1 ring-current/20">
              Primary
            </span>
          }
        >
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold tracking-wider text-current/70 uppercase">
              Calamansi Surface
            </p>
            <p className="text-sm leading-relaxed font-medium text-current/85">
              Leans smoothly towards the pointer with real-time 3D spring
              physics and interactive light sheen.
            </p>
          </div>

          <div className="mt-4 flex h-16 items-center justify-center rounded-xl bg-current/10 text-xs font-medium text-current/80 ring-1 ring-current/15">
            Interactive 3D Plane
          </div>
        </TiltCard>

        <TiltCard
          maxTilt={8}
          glare={false}
          hoverScale={1.04}
          variant={variant}
          icon={<Layers className="size-5" />}
          title="Flesh"
          subtitle="maxTilt 8 · no glare"
          badge={
            <span className="rounded-full bg-current/15 px-2.5 py-0.5 text-[10px] font-semibold text-current ring-1 ring-current/20">
              Springs
            </span>
          }
        >
          <dl className="grid grid-cols-2 gap-2">
            {[
              ["Spring", "220 / 18"],
              ["Fallback", "reduced motion"],
              ["Pointer", "continuous"],
              ["Return", "flat"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl bg-current/10 p-2.5 ring-1 ring-current/15"
              >
                <dt className="text-[10px] font-semibold tracking-[0.14em] text-current/70 uppercase">
                  {label}
                </dt>
                <dd className="mt-0.5 truncate text-xs font-semibold text-current">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </TiltCard>
      </div>

      <p className="max-w-md text-center text-xs font-medium text-muted-foreground">
        Move your pointer over a card, then let it go.
      </p>
    </div>
  );
}
