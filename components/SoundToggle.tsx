"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Volume2, VolumeX } from "lucide-react";
import {
  getSfxEnabled,
  loadSfxPreference,
  playSfx,
  primeSfx,
  setSfxEnabled,
  subscribeSfx,
} from "@/lib/sfx-client";
import { cn } from "@/lib/utils";

/**
 * The sound switch, a sibling of the theme toggle: the same bare size, the same
 * cross-fade between two glyphs. Turning sound on confirms itself with the toggle
 * clip; turning it off is silent, because by then it already is.
 */
export default function SoundToggle({
  className = "",
}: {
  className?: string;
}) {
  const enabled = useSyncExternalStore(subscribeSfx, getSfxEnabled, () => true);

  useEffect(() => {
    loadSfxPreference();
    primeSfx();
  }, []);

  return (
    <button
      type="button"
      onClick={() => {
        const next = !enabled;
        setSfxEnabled(next);
        if (next) playSfx("toggle");
      }}
      aria-pressed={enabled}
      aria-label={enabled ? "Turn sound off" : "Turn sound on"}
      title={enabled ? "Sound on" : "Sound off"}
      className={cn(
        "relative inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <Volume2
        className={cn(
          "size-4 transition-all duration-300",
          enabled ? "rotate-0 scale-100" : "-rotate-90 scale-0",
        )}
      />
      <VolumeX
        className={cn(
          "absolute size-4 transition-all duration-300",
          enabled ? "rotate-90 scale-0" : "rotate-0 scale-100",
        )}
      />
      <span className="sr-only">
        {enabled ? "Disable sound" : "Enable sound"}
      </span>
    </button>
  );
}
