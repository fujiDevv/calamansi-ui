"use client";

import { useState } from "react";
import {
  StackedToasts,
  type ToastItem,
  type ToastVariant,
} from "@/components/ui/stacked-toasts";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  Layers,
  RotateCcw,
} from "lucide-react";

const INITIAL_TOASTS: ToastItem[] = [
  {
    id: "1",
    title: "Deployment complete",
    description: "Production branch deployed to edge nodes in 1.4s.",
    variant: "success",
    action: {
      label: "View logs",
      onClick: () => alert("Viewing deployment logs"),
    },
  },
  {
    id: "2",
    title: "High API latency detected",
    description: "Endpoint /v1/chat-stream took 1,240ms to respond.",
    variant: "warning",
  },
  {
    id: "3",
    title: "Weekly report ready",
    description: "Analytics summary generated for 42,890 events.",
    variant: "info",
  },
];

export default function StackedToastsDemo() {
  const [toasts, setToasts] = useState<ToastItem[]>(INITIAL_TOASTS);
  const [isExpanded, setIsExpanded] = useState<boolean | undefined>(undefined);

  const addToast = (variant: ToastVariant) => {
    const id = Date.now().toString();
    const config: Record<ToastVariant, { title: string; description: string }> =
      {
        success: {
          title: "Backup snapshot created",
          description: "Postgres schema and tables synced successfully.",
        },
        warning: {
          title: "Rate limit threshold reached",
          description: "85% of allowed token quota consumed for this hour.",
        },
        error: {
          title: "Database connection failed",
          description: "Could not reach replica in us-east-1. Retrying in 5s.",
        },
        info: {
          title: "New component registered",
          description: "Added to the local shadcn registry manifest.",
        },
        default: {
          title: "System notification",
          description: "Background maintenance scheduled tonight at 02:00 UTC.",
        },
      };

    const newToast: ToastItem = {
      id,
      title: config[variant].title,
      description: config[variant].description,
      variant,
    };

    setToasts((prev) => [newToast, ...prev]);
  };

  const handleDismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const resetToasts = () => {
    setToasts(INITIAL_TOASTS);
    setIsExpanded(undefined);
  };

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-5 px-1 py-4 sm:gap-6 sm:py-6">
      {/* Control Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
        <button
          type="button"
          onClick={() => addToast("success")}
          className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 font-medium text-emerald-600 dark:text-emerald-400 transition hover:bg-emerald-500/20"
        >
          <CheckCircle2 className="size-3.5" />
          Success
        </button>

        <button
          type="button"
          onClick={() => addToast("warning")}
          className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 font-medium text-amber-600 dark:text-amber-400 transition hover:bg-amber-500/20"
        >
          <AlertTriangle className="size-3.5" />
          Warning
        </button>

        <button
          type="button"
          onClick={() => addToast("error")}
          className="flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 font-medium text-rose-600 dark:text-rose-400 transition hover:bg-rose-500/20"
        >
          <AlertCircle className="size-3.5" />
          Error
        </button>

        <button
          type="button"
          onClick={() => addToast("info")}
          className="flex items-center gap-1.5 rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-1.5 font-medium text-sky-600 dark:text-sky-400 transition hover:bg-sky-500/20"
        >
          <Info className="size-3.5" />
          Info
        </button>

        <button
          type="button"
          onClick={() =>
            setIsExpanded((prev) => (prev === undefined ? true : !prev))
          }
          className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 font-medium text-foreground transition hover:bg-muted"
        >
          <Layers className="size-3.5 text-primary" />
          {isExpanded ? "Collapse" : "Fan Out Stack"}
        </button>

        <button
          type="button"
          onClick={resetToasts}
          className="flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          title="Reset toasts"
        >
          <RotateCcw className="size-3.5" />
        </button>
      </div>

      {/* Interactive Preview Sandbox */}
      <div className="relative flex h-80 w-full flex-col justify-end overflow-hidden rounded-2xl border border-border/80 bg-muted/20 p-4 sm:p-6">
        <div className="absolute top-4 right-4 left-4 text-xs text-muted-foreground sm:left-5 sm:right-5">
          <p className="font-semibold text-foreground">Interactive Stage</p>
          <p className="text-[11px]">
            Hover over the bottom stack to fan out, or click the buttons above
            to push new cards.
          </p>
        </div>

        {/* Stacked Toasts Container */}
        <div className="flex w-full justify-end">
          <StackedToasts
            toasts={toasts}
            onDismiss={handleDismiss}
            isExpanded={isExpanded}
            mode="inline"
            position="bottom-right"
          />
        </div>
      </div>
    </div>
  );
}
