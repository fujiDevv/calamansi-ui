"use client";

import { useState } from "react";
import { Citrus, Layers } from "lucide-react";
import { TiltCard, type TiltCardVariant } from "@/components/ui/tilt-card";

const VARIANTS: { id: TiltCardVariant; label: string }[] = [
  { id: "calamansi", label: "Calamansi" },
  { id: "slate", label: "Slate Glass" },
  { id: "citrus", label: "Warm Citrus" },
];

export default function TiltCardDemo() {
  const [variant, setVariant] = useState<TiltCardVariant>("calamansi");

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

      <div className="grid w-full max-w-3xl gap-5 sm:grid-cols-2 sm:gap-6">
        <TiltCard
          maxTilt={16}
          variant={variant}
          icon={<Citrus className="size-5" />}
          title="Rind"
          subtitle="maxTilt 16 · glare on"
          badge={
            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-semibold text-white/90 backdrop-blur-xs">
              Primary
            </span>
          }
        >
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
              Calamansi Surface
            </p>
            <p className="text-sm font-medium leading-relaxed text-white/85">
              Leans smoothly towards the pointer with real-time 3D spring physics and interactive light sheen.
            </p>
          </div>

          <div className="mt-4 flex h-16 items-center justify-center rounded-xl bg-white/10 text-xs font-medium text-white/80 ring-1 ring-white/15 backdrop-blur-xs">
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
            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-semibold text-white/90 backdrop-blur-xs">
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
                className="rounded-xl bg-white/10 p-2.5 ring-1 ring-white/15"
              >
                <dt className="text-[10px] font-semibold tracking-[0.14em] text-white/70 uppercase">
                  {label}
                </dt>
                <dd className="mt-0.5 truncate text-xs font-semibold text-white">
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
