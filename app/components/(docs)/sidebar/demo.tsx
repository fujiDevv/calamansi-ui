"use client";

import { useState } from "react";
import {
  FlaskConical,
  Map,
  Package,
  Palette,
  Rocket,
  Ruler,
  Sparkles,
  Type,
} from "lucide-react";
import {
  Sidebar,
  type SidebarMarkerStyle,
  type SidebarSection,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

/**
 * A made-up nav, not this site's. None of these rows points anywhere — they are
 * labels, so picking one moves the marker and nothing else. The lesson from a
 * demo of a nav is the nav, and it should not be spent navigating you off the
 * page you are reading it on.
 *
 * Three sections, three inks: the marker only has something to crossfade if it
 * has somewhere to go, and the first section takes no colour, so it shows the
 * fallback too.
 */
const SAMPLE: SidebarSection[] = [
  {
    label: "Getting started",
    items: [
      { label: "Overview", icon: <Sparkles /> },
      { label: "Quick start", icon: <Rocket /> },
      { label: "Install", icon: <Package /> },
    ],
  },
  {
    label: "Foundations",
    color: "#7aa2ff",
    items: [
      { label: "Colour", icon: <Palette /> },
      { label: "Type scale", icon: <Type /> },
      { label: "Spacing", icon: <Ruler /> },
    ],
  },
  {
    label: "Reference",
    color: "#a78bfa",
    items: [
      { label: "Recipes", icon: <FlaskConical /> },
      { label: "Changelog", badge: "New" },
      { label: "Roadmap", icon: <Map />, disabled: true },
    ],
  },
];

const MARKERS: SidebarMarkerStyle[] = ["dot", "pip", "bar", "glow"];

export default function SidebarDemo() {
  // "Type scale" — mid-list, in the middle section, so the rail opens with the
  // marker somewhere it has room to travel from.
  const [active, setActive] = useState(4);
  const [marker, setMarker] = useState<SidebarMarkerStyle>("pip");
  const [open, setOpen] = useState(false);

  const sample = {
    sections: SAMPLE,
    value: active,
    marker,
    navLabel: "Sample navigation",
  };

  return (
    <div className="flex w-full max-w-4xl flex-col items-start gap-5 p-1 sm:flex-row sm:gap-7">
      {/* the rail — the nav itself, with no chrome of ours around it */}
      <Sidebar
        {...sample}
        onChange={(index) => setActive(index)}
        className="w-full max-w-56 shrink-0 px-3"
      />

      <div className="flex min-w-0 flex-col gap-4">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Marker
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {MARKERS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setMarker(value)}
                className={cn(
                  "cursor-pointer rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors",
                  marker === value
                    ? "border-primary bg-primary/15 text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
          Pick a row and the marker arcs to it, arriving in the colour of the
          section it lands in — jump between sections and it crossfades on the
          way, and the label is shoved aside as it arrives. The drawer is the
          same panel again, over the page.
        </p>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-fit cursor-pointer rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
        >
          Open the drawer
        </button>
      </div>

      {/* the same panel again, this time over the page */}
      <Sidebar
        {...sample}
        variant="drawer"
        open={open}
        onOpenChange={setOpen}
        onChange={(index) => {
          setActive(index);
          setOpen(false);
        }}
      />
    </div>
  );
}
