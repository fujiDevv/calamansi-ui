"use client";

import { useState } from "react";
import {
  ThinkingAccordion,
  type ThinkingStatus,
} from "@/components/ui/thinking-accordion";
import { Play, RotateCcw, Sparkles } from "lucide-react";

const SAMPLE_THOUGHTS = `Analyzing user request:
- User is asking for optimal layout architecture for high-density dashboard.
- Constraints identified: 60fps frame budget, dark theme default, responsive sidebar.

Step 1: Evaluating CSS Grid vs Flexbox subgrids
- Subgrid provides unified track alignment across parent-child cards without nesting overhead.
- Container queries will manage individual card adaptations.

Step 2: Determining animation pipeline
- Use hardware-accelerated transforms (translate3d, scale) for layout transitions.
- Offload non-critical metrics computation to Web Worker.

Conclusion:
- Recommend CSS Grid with grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))
- Return actionable Tailwind markup and performance benchmarks.`;

export default function ThinkingAccordionDemo() {
  const [status, setStatus] = useState<ThinkingStatus>("completed");
  const [variant, setVariant] = useState<"bordered" | "subtle" | "ghost">(
    "bordered",
  );
  const [open, setOpen] = useState(false);

  const simulateThinking = () => {
    setStatus("thinking");
    setOpen(true);
    setTimeout(() => {
      setStatus("completed");
    }, 3800);
  };

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-5 px-1 py-4 sm:gap-6 sm:py-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
        <button
          type="button"
          onClick={simulateThinking}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 font-medium text-foreground transition hover:bg-muted"
        >
          {status === "thinking" ? (
            <>
              <Sparkles className="size-3.5 animate-spin text-primary" />
              Simulating...
            </>
          ) : (
            <>
              <Play className="size-3.5 fill-current" />
              Simulate Thinking (3.8s)
            </>
          )}
        </button>

        <div className="flex rounded-lg border border-border bg-muted/30 p-0.5">
          {(["bordered", "subtle", "ghost"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={`rounded-md px-2.5 py-1 font-medium capitalize transition ${
                variant === v
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {v}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            setStatus("completed");
            setOpen(false);
          }}
          className="flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <RotateCcw className="size-3.5" />
          Reset
        </button>
      </div>

      {/* Mock AI Message Bubble Container */}
      <div className="w-full space-y-4 rounded-2xl border border-border/80 bg-card p-4 shadow-sm sm:p-5">
        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 font-semibold text-primary">
              AI
            </div>
            <span className="truncate font-medium text-foreground">
              Calamansi Reasoning
            </span>
          </div>
          <span className="shrink-0 text-[11px]">gemini-2.5-pro</span>
        </div>

        {/* Thinking Accordion */}
        <ThinkingAccordion
          status={status}
          duration={status === "completed" ? 4.2 : undefined}
          open={open}
          onOpenChange={setOpen}
          variant={variant}
          rawText={SAMPLE_THOUGHTS}
        >
          {SAMPLE_THOUGHTS}
        </ThinkingAccordion>

        <p className="text-sm leading-relaxed text-foreground">
          Based on the architectural requirements, we recommend using CSS Grid
          with container queries. This guarantees unified column alignment
          across widget cards while preserving 60fps rendering budgets.
        </p>
      </div>
    </div>
  );
}
