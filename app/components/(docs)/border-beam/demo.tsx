"use client";

import { useState } from "react";
import { ArrowRight, Flame, Layers, Zap } from "lucide-react";
import { BorderBeam } from "@/components/ui/border-beam";
import { cn } from "@/lib/utils";

export default function BorderBeamDemo() {
  const [activeTab, setActiveTab] = useState<"cards" | "button">("cards");

  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-3 sm:p-10">
      <div className="mb-6 flex flex-wrap items-center justify-center gap-1 rounded-full border border-border/70 bg-card/60 p-1 backdrop-blur-sm sm:mb-8 sm:gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("cards")}
          className={cn(
            "rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
            activeTab === "cards"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Card Presets
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("button")}
          className={cn(
            "rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
            activeTab === "button"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Interactive Element
        </button>
      </div>

      {activeTab === "cards" ? (
        <div className="grid w-full max-w-4xl gap-4 sm:gap-5 md:grid-cols-3">
          {/* Preset 1: Citrus Signature */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
            <BorderBeam
              size={220}
              duration={12}
              colorFrom="var(--color-calamansi-rind, #b4e84c)"
              colorTo="var(--color-calamansi-flesh, #ff9e3d)"
              borderWidth={1.5}
            />
            <div>
              <span className="inline-flex size-9 items-center justify-center rounded-xl bg-muted text-foreground/80">
                <Zap className="size-4.5 text-primary" />
              </span>
              <h3 className="mt-4 font-runde text-lg font-semibold tracking-tight">
                Citrus Signature
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                Smooth continuous pulse traveling with Calamansi lime to orange
                gradient.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs font-mono text-muted-foreground/80">
              <span className="rounded bg-muted px-1.5 py-0.5">
                size: 220px
              </span>
              <span className="rounded bg-muted px-1.5 py-0.5">12s</span>
            </div>
          </div>

          {/* Preset 2: Dual Orbiting Beams */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
            <BorderBeam
              size={180}
              duration={10}
              initialOffset={0}
              colorFrom="#b4e84c"
              colorTo="#ff9e3d"
              borderWidth={1.5}
            />
            <BorderBeam
              size={180}
              duration={10}
              initialOffset={50}
              colorFrom="#ff7e9d"
              colorTo="#ff9e3d"
              borderWidth={1.5}
            />
            <div>
              <span className="inline-flex size-9 items-center justify-center rounded-xl bg-muted text-foreground/80">
                <Layers className="size-4.5 text-calamansi-blush" />
              </span>
              <h3 className="mt-4 font-runde text-lg font-semibold tracking-tight">
                Dual Orbit
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                Two synchronized beams 180 degrees out of phase orbiting the
                container in tandem.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs font-mono text-muted-foreground/80">
              <span className="rounded bg-muted px-1.5 py-0.5">
                offset: 50%
              </span>
              <span className="rounded bg-muted px-1.5 py-0.5">dual</span>
            </div>
          </div>

          {/* Preset 3: Counter Pulse */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
            <BorderBeam
              size={260}
              duration={7}
              reverse
              colorFrom="#ff9e3d"
              colorTo="#ff7e9d"
              borderWidth={2}
            />
            <div>
              <span className="inline-flex size-9 items-center justify-center rounded-xl bg-muted text-foreground/80">
                <Flame className="size-4.5 text-calamansi-flesh" />
              </span>
              <h3 className="mt-4 font-runde text-lg font-semibold tracking-tight">
                Reverse Pulse
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                Counter-clockwise trajectory with a wider 2px stroke and rapid
                rotation.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs font-mono text-muted-foreground/80">
              <span className="rounded bg-muted px-1.5 py-0.5">reverse</span>
              <span className="rounded bg-muted px-1.5 py-0.5">7s</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex w-full flex-col items-center justify-center gap-5 sm:gap-6">
          <div className="relative w-full overflow-hidden rounded-full border border-border/80 bg-card p-1 shadow-sm sm:w-auto">
            <BorderBeam
              size={80}
              duration={6}
              borderRadius={9999}
              colorFrom="#b4e84c"
              colorTo="#ff9e3d"
              borderWidth={2}
            />
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-background px-4 py-2.5 text-xs font-medium text-foreground transition hover:bg-muted sm:w-auto sm:gap-2.5 sm:px-6 sm:text-sm"
            >
              <Zap className="size-4 shrink-0 text-primary" />
              <span>Explore Calamansi Components</span>
              <ArrowRight className="size-3.5 shrink-0 opacity-60" />
            </button>
          </div>
          <p className="max-w-xs text-center text-xs text-muted-foreground">
            Border beams adapt to any border radius, from rounded cards to pill
            buttons.
          </p>
        </div>
      )}
    </div>
  );
}
