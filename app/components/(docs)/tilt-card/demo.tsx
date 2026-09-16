"use client";

import { Citrus, Sparkles } from "lucide-react";
import { TiltCard } from "@/components/ui/tilt-card";

export default function TiltCardDemo() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 p-6">
      <div className="grid w-full max-w-3xl gap-5 sm:grid-cols-2">
        <TiltCard maxTilt={16}>
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Citrus className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="font-runde text-base font-semibold tracking-tight">
                Rind
              </p>
              <p className="text-xs text-muted-foreground">
                maxTilt 16 · glare on
              </p>
            </div>
          </div>

          <div className="mt-6 h-32 rounded-xl bg-gradient-to-br from-primary/70 via-accent/60 to-calamansi-blush/60" />
        </TiltCard>

        <TiltCard maxTilt={7} glare={false} hoverScale={1.04}>
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-muted text-foreground/70">
              <Sparkles className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="font-runde text-base font-semibold tracking-tight">
                Flesh
              </p>
              <p className="text-xs text-muted-foreground">
                maxTilt 7 · no glare
              </p>
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-3">
            {[
              ["Spring", "220 / 18"],
              ["Fallback", "reduced motion"],
              ["Pointer", "continuous"],
              ["Return", "flat"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-muted p-3">
                <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {label}
                </dt>
                <dd className="mt-1 truncate text-sm font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </TiltCard>
      </div>

      <p className="text-center text-xs font-medium text-muted-foreground">
        Move your pointer over a card, then let it go.
      </p>
    </div>
  );
}
