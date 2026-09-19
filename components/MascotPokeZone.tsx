"use client";

import type { ReactNode } from "react";
import { pokeMascot } from "@/lib/mascot-pokes-client";
import { playSfx } from "@/lib/sfx-client";

/**
 * Counts a poke whenever a press lands on the mascot inside it.
 *
 * Wrapping beats teaching `Calamansi` about the counter: the component in the
 * registry stays exactly what users install, and the site behaviour lives here.
 * `contents` keeps the wrapper out of the hero's flex layout.
 */
export default function MascotPokeZone({ children }: { children: ReactNode }) {
  return (
    <div
      className="contents"
      onPointerDown={() => {
        pokeMascot();
        playSfx("pop");
      }}
    >
      {children}
    </div>
  );
}
