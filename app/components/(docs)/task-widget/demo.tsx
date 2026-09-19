"use client";

import { useState } from "react";
import {
  TaskWidget,
  type TaskItem,
  type TaskWidgetCorner,
  type TaskWidgetVariant,
} from "@/components/ui/task-widget";
import { Coffee, Layers, Link2, PenTool, Sparkles, Users } from "lucide-react";

const INITIAL_TASKS: TaskItem[] = [
  {
    id: 1,
    title: "Brew citrus pour-over",
    completed: true,
    icon: <Coffee className="size-5" />,
  },
  {
    id: 2,
    title: "Design tokens review",
    completed: false,
    icon: <Layers className="size-5" />,
  },
  {
    id: 3,
    title: "Sync with core design team",
    completed: false,
    icon: <Users className="size-5" />,
  },
  {
    id: 4,
    title: "Audit glassmorphism shaders",
    completed: false,
    icon: <Sparkles className="size-5" />,
  },
  {
    id: 5,
    title: "Ship registry release",
    completed: false,
    icon: <Link2 className="size-5" />,
  },
  {
    id: 6,
    title: "Refresh portfolio case study",
    completed: false,
    icon: <PenTool className="size-5" />,
  },
];

const VARIANTS: {
  id: TaskWidgetVariant;
  label: string;
  gradient: string;
}[] = [
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
  {
    id: "black",
    label: "Dark Black",
    gradient: "linear-gradient(135deg, #27272a 0%, #18181b 50%, #09090b 100%)",
  },
];

export default function TaskWidgetDemo() {
  const [variant, setVariant] = useState<TaskWidgetVariant>("calamansi");
  const [corner, setCorner] = useState<TaskWidgetCorner>("rounded");
  const [timeFormat, setTimeFormat] = useState<"12h" | "24h">("12h");
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const currentVariant = VARIANTS.find((v) => v.id === variant) ?? VARIANTS[0];

  const handleToggle = (taskId: string | number, completed: boolean) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed } : t)),
    );
  };

  return (
    <div className="flex w-full flex-col items-center gap-5 px-1 py-3 sm:gap-6 sm:py-4">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-center gap-3">
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
                      : "opacity-80 ring-1 ring-white/20 hover:opacity-100"
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

        <button
          type="button"
          onClick={() =>
            setTimeFormat((prev) => (prev === "12h" ? "24h" : "12h"))
          }
          className="rounded-full border border-border/70 bg-card/60 px-3.5 py-2 text-xs font-semibold text-muted-foreground shadow-2xs backdrop-blur-xs transition-colors hover:text-foreground"
        >
          Format: {timeFormat}
        </button>

        <button
          type="button"
          onClick={() =>
            setCorner((prev) => (prev === "rounded" ? "squircle" : "rounded"))
          }
          aria-label="Toggle the shell corner"
          className="rounded-full border border-border/70 bg-card/60 px-3.5 py-2 text-xs font-semibold text-muted-foreground shadow-2xs backdrop-blur-xs transition-colors hover:text-foreground"
        >
          Corner: {corner === "rounded" ? "Radius" : "Squircle"}
        </button>
      </div>

      {/*
        Main Interactive Widget.

        Scaled down rather than narrowed. The widget's type is written in fixed
        sizes — its clock is `text-5xl sm:text-7xl lg:text-8xl` — so a narrower
        column would only reflow it and leave the numerals looking larger against
        a thinner card, not smaller. `scale` shrinks all of it together, and it is
        the same lever the gallery tiles pull (at a harder 0.38).
      */}
      <div className="flex w-full justify-center p-0 sm:p-2">
        <div className="w-full max-w-[780px] scale-[0.7]">
          <TaskWidget
            tasks={tasks}
            onTaskToggle={handleToggle}
            variant={variant}
            corner={corner}
            timeFormat={timeFormat}
            title="Today's Focus"
          />
        </div>
      </div>

      <p className="max-w-md text-center text-xs text-muted-foreground">
        Click any task card to focus and toggle completion. Scroll the tasks
        deck to smoothly animate away the overflow blur and expand the progress
        indicator. Inspired by{" "}
        <a
          href="https://sprrrint.com/jaydwivedi"
          target="_blank"
          rel="noreferrer"
          className="font-medium underline underline-offset-4 hover:text-foreground"
        >
          Jay Dwivedi&apos;s design
        </a>
        .
      </p>
    </div>
  );
}
