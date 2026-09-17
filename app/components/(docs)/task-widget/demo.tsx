"use client";

import { useState } from "react";
import {
  TaskWidget,
  type TaskItem,
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

const VARIANTS: { id: TaskWidgetVariant; label: string }[] = [
  { id: "calamansi", label: "Calamansi" },
  { id: "slate", label: "Slate Glass" },
  { id: "citrus", label: "Warm Citrus" },
];

export default function TaskWidgetDemo() {
  const [variant, setVariant] = useState<TaskWidgetVariant>("calamansi");
  const [timeFormat, setTimeFormat] = useState<"12h" | "24h">("12h");
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);

  const handleToggle = (taskId: string | number, completed: boolean) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed } : t)),
    );
  };

  return (
    <div className="flex w-full flex-col items-center gap-5 px-1 py-3 sm:gap-6 sm:py-4">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        <div className="flex items-center rounded-full border border-border/70 bg-card/60 p-1 shadow-2xs backdrop-blur-xs">
          {VARIANTS.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setVariant(v.id)}
              className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
                variant === v.id
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() =>
            setTimeFormat((prev) => (prev === "12h" ? "24h" : "12h"))
          }
          className="rounded-full border border-border/70 bg-card/60 px-3.5 py-1 text-xs font-semibold text-muted-foreground shadow-2xs backdrop-blur-xs transition-colors hover:text-foreground"
        >
          Format: {timeFormat}
        </button>
      </div>

      {/* Main Interactive Widget */}
      <div className="flex w-full justify-center p-0 sm:p-2">
        <TaskWidget
          tasks={tasks}
          onTaskToggle={handleToggle}
          variant={variant}
          timeFormat={timeFormat}
          title="Today's Focus"
        />
      </div>

      <p className="max-w-md text-center text-xs text-muted-foreground">
        Click any task card to focus and toggle completion. Scroll the tasks
        deck to smoothly animate away the overflow blur and expand the progress indicator.
        Inspired by{" "}
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
