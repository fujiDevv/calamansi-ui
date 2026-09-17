"use client";

import { useState } from "react";
import {
  BarChart3,
  Bell,
  LayoutDashboard,
  Plug,
  Sparkle,
  User,
  Zap,
} from "lucide-react";
import {
  BounceSidebar,
  type BounceSidebarItem,
  type BounceSidebarMarkerVariant,
} from "@/components/ui/bounce-sidebar";

const ITEMS: BounceSidebarItem[] = [
  { label: "WORKSPACE", heading: true },
  {
    label: "Dashboard",
    icon: <LayoutDashboard className="size-4" />,
    badge: "Live",
  },
  {
    label: "Analytics",
    icon: <BarChart3 className="size-4" />,
    badge: "+24%",
  },
  {
    label: "Activity",
    icon: <Zap className="size-4" />,
  },
  { label: "PREFERENCES", heading: true },
  {
    label: "Account",
    icon: <User className="size-4" />,
  },
  {
    label: "Integrations",
    icon: <Plug className="size-4" />,
    badge: "5",
  },
  {
    label: "Notifications",
    icon: <Bell className="size-4" />,
  },
];

const COLORS = [
  { name: "Calamansi Rind", value: "var(--primary, #b4e84c)" },
  { name: "Citrus Flesh", value: "#ff9e3d" },
  { name: "Tart Orange", value: "#FC4C01" },
  { name: "Cheek Blush", value: "#ff7e9d" },
];

const VARIANTS: { label: string; value: BounceSidebarMarkerVariant }[] = [
  { label: "Dot", value: "dot" },
  { label: "Pip (Seed)", value: "pip" },
  { label: "Glow", value: "glow" },
];

export default function BounceSidebarDemo() {
  const [active, setActive] = useState(1);
  const [dotColor, setDotColor] = useState("var(--primary, #b4e84c)");
  const [variant, setVariant] = useState<BounceSidebarMarkerVariant>("pip");
  const [squish, setSquish] = useState(true);
  const [ripple, setRipple] = useState(true);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 p-4 sm:p-8">
      {/* Controls Bar */}
      <div className="flex w-full max-w-md flex-wrap items-center justify-center gap-x-3 gap-y-2 rounded-xl border border-border/60 bg-card/60 p-3 shadow-2xs backdrop-blur-sm sm:max-w-none sm:gap-3">
        {/* Color Switcher */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-medium text-muted-foreground">
            Color:
          </span>
          <div className="flex gap-1">
            {COLORS.map((c) => (
              <button
                key={c.name}
                type="button"
                title={c.name}
                onClick={() => setDotColor(c.value)}
                className="relative size-5 rounded-full border border-border/80 transition-transform hover:scale-110"
                style={{
                  backgroundColor: c.value,
                  outline:
                    dotColor === c.value
                      ? "2px solid var(--foreground)"
                      : "none",
                  outlineOffset: "1px",
                }}
              />
            ))}
          </div>
        </div>

        <div className="hidden h-4 w-px bg-border sm:block" />

        {/* Variant Switcher */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-medium text-muted-foreground">
            Shape:
          </span>
          {VARIANTS.map((v) => (
            <button
              key={v.value}
              type="button"
              onClick={() => setVariant(v.value)}
              className="rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors"
              style={{
                backgroundColor:
                  variant === v.value ? "var(--muted)" : "transparent",
                color:
                  variant === v.value
                    ? "var(--foreground)"
                    : "var(--muted-foreground)",
              }}
            >
              {v.label}
            </button>
          ))}
        </div>

        <div className="hidden h-4 w-px bg-border sm:block" />

        {/* Feature Toggles */}
        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground">
            <input
              type="checkbox"
              checked={squish}
              onChange={(e) => setSquish(e.target.checked)}
              className="size-3.5 rounded-xs accent-primary"
            />
            <span>Squash & Stretch</span>
          </label>
          <label className="flex cursor-pointer items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground">
            <input
              type="checkbox"
              checked={ripple}
              onChange={(e) => setRipple(e.target.checked)}
              className="size-3.5 rounded-xs accent-primary"
            />
            <span>Landing Ripple</span>
          </label>
        </div>
      </div>

      {/* Mock App Sidebar Card */}
      <div className="w-full max-w-xs rounded-2xl border border-border/70 bg-card p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center justify-between border-b border-border/50 pb-3">
          <div>
            <p className="font-runde text-sm font-semibold text-foreground">
              Navigation Menu
            </p>
            <p className="text-[11px] text-muted-foreground">
              Tactile curved motion dynamics
            </p>
          </div>
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: dotColor }}
          />
        </div>

        <BounceSidebar
          items={ITEMS}
          value={active}
          onChange={setActive}
          dotColor={dotColor}
          markerVariant={variant}
          squish={squish}
          ripple={ripple}
        />
      </div>

      <p className="text-center text-xs font-medium text-muted-foreground">
        Click any row to watch the marker stretch along the arc trajectory and
        land with an elastic squash.
      </p>
    </div>
  );
}
