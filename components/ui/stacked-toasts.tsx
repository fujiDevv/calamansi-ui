"use client";

import {
  forwardRef,
  useState,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  ChevronDown,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

export type ToastVariant = "default" | "success" | "info" | "warning" | "error";

export type ToastItem = {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
  /** Optional visual marker dots for long content, e.g. masked reasoning chunks. */
  markers?: number;
};

export type StackedToastsProps = {
  /** Array of active toasts. The latest toast is at index 0. */
  toasts: ToastItem[];
  /** Callback fired when a toast is dismissed. */
  onDismiss: (id: string) => void;
  /** Screen corner positioning. Default: "bottom-right" */
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  /** Maximum visible toasts in the collapsed stack. Default: 3 */
  maxVisible?: number;
  /** Whether hovering fans out all toasts. Default: true */
  expandOnHover?: boolean;
  /** Controlled expanded state. */
  isExpanded?: boolean;
  /** Display mode: "fixed" for screen viewport corners or "inline" for preview containers. Default: "fixed" */
  mode?: "fixed" | "inline";
  /** Optional custom CSS classes for the container. */
  className?: string;
  /** Optional cassette-style acceleration curve on expand. Default: true */
  cassette?: boolean;
};

const VARIANT_ICONS: Record<ToastVariant, ReactNode> = {
  default: null,
  success: <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />,
  info: <Info className="size-4 text-sky-500 shrink-0" />,
  warning: <AlertTriangle className="size-4 text-amber-500 shrink-0" />,
  error: <AlertCircle className="size-4 text-rose-500 shrink-0" />,
};

/**
 * A fixed stacked toast deck.
 *
 * Fixes:
 * - tighter stacking math with a stable expanded offset,
 * - smoother expand/collapse with spring or tween fallback,
 * - pointer-reactive edge shimmer that does not fight layout motion,
 * - stable expand/collapse floating action button.
 */
export const StackedToasts = forwardRef<HTMLDivElement, StackedToastsProps>(
  function StackedToasts(
    {
      toasts,
      onDismiss,
      position = "bottom-right",
      maxVisible = 3,
      expandOnHover = true,
      isExpanded: controlledExpanded,
      mode = "fixed",
      className,
      cassette = true,
    },
    ref,
  ) {
    const [hovered, setHovered] = useState(false);
    const [pointerX, setPointerX] = useState(0);
    const [pointerY, setPointerY] = useState(0);
    const expanded = controlledExpanded ?? (expandOnHover ? hovered : false);

    const isBottom = position.startsWith("bottom");
    const isRight = position.endsWith("right");

    const positionClasses =
      position === "bottom-right"
        ? "bottom-6 right-6 items-end"
        : position === "bottom-left"
          ? "bottom-6 left-6 items-start"
          : position === "top-right"
            ? "top-6 right-6 items-end"
            : "top-6 left-6 items-start";

    const visibleToasts = toasts.slice(
      0,
      expanded ? toasts.length : maxVisible,
    );

    const stackGap = expanded ? 72 : 12;
    const stackOffset = (index: number) =>
      isBottom ? -index * stackGap : index * stackGap;

    const scaleBase = (index: number) => 1 - index * 0.045;
    const opacityBase = (index: number) =>
      expanded ? 1 : Math.max(0.25, 1 - index * 0.16);

    return (
      <div
        ref={ref}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onPointerMove={(e: ReactPointerEvent<HTMLDivElement>) => {
          setPointerX(e.clientX);
          setPointerY(e.clientY);
        }}
        className={cn(
          "pointer-events-none z-50 flex flex-col gap-2 p-2 select-none",
          mode === "fixed" ? positionClasses : "relative w-full max-w-sm",
          className,
        )}
      >
        {/* max-w-full only bites inside an inline preview, where the parent has a set width */}
        <div className="relative w-84 max-w-full sm:w-96">
          <AnimatePresence mode="popLayout" initial={false}>
            {visibleToasts.map((toast, index) => {
              const icon =
                toast.icon ??
                (toast.variant ? (VARIANT_ICONS[toast.variant] ?? null) : null);

              const offset = stackOffset(index);
              const zIndex = 50 - index;

              return (
                <motion.div
                  key={toast.id}
                  layout
                  initial={{
                    opacity: 0,
                    y: isBottom ? 48 : -48,
                    scale: 0.9,
                  }}
                  animate={{
                    y: offset,
                    scale: expanded ? 1 : scaleBase(index),
                    opacity: expanded ? 1 : opacityBase(index),
                    zIndex,
                    transition: {
                      type: cassette ? "spring" : "tween",
                      stiffness: cassette ? 380 : undefined,
                      damping: cassette ? 24 : undefined,
                      ease: cassette ? undefined : "easeInOut",
                    },
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.85,
                    transition: { duration: 0.2 },
                  }}
                  className={cn(
                    "pointer-events-auto absolute left-0 right-0 flex items-start justify-between gap-3 rounded-xl border border-border/80 bg-card p-4 shadow-lg backdrop-blur-md transition-colors",
                    isBottom ? "bottom-0" : "top-0",
                    index === 0 && "ring-1 ring-border/50",
                  )}
                >
                  {/* Pointer-reactive edge shimmer on top card */}
                  {index === 0 && (
                    <motion.div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 rounded-xl opacity-0"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.05) 100%)",
                        backgroundPosition: `${pointerX * 0.03}px ${pointerY * 0.02}px`,
                        backgroundSize: "200% 200%",
                      }}
                      animate={{
                        opacity: expanded ? 0.5 : hovered ? 0.35 : 0,
                      }}
                      transition={{ duration: 0.2 }}
                    />
                  )}

                  {/* Neon pulse on top card */}
                  {index === 0 && (
                    <motion.div
                      aria-hidden="true"
                      className="absolute inset-0 rounded-xl opacity-0"
                      animate={{
                        opacity: [0, 0.25, 0],
                        boxShadow: [
                          "0 0 8px 0 rgba(120,180,255,0.35)",
                          "0 0 24px 2px rgba(120,180,255,0.65)",
                          "0 0 8px 0 rgba(120,180,255,0.35)",
                        ],
                      }}
                      transition={{
                        duration: 1.8,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  )}

                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    {icon && <div className="mt-0.5 shrink-0">{icon}</div>}
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <p className="truncate text-xs font-semibold text-foreground">
                        {toast.title}
                      </p>
                      {toast.description && (
                        <p className="line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                          {toast.description}
                        </p>
                      )}

                      {/* Content indicator dots */}
                      {toast.markers && toast.markers > 0 && (
                        <div className="mt-2 flex items-center gap-1.5">
                          {Array.from(
                            { length: Math.min(toast.markers, 10) },
                            (_, i) => i,
                          ).map((i) => (
                            <motion.span
                              key={i}
                              className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40"
                              initial={{ scale: 0 }}
                              animate={{
                                scale: 1,
                                backgroundColor:
                                  i === 0
                                    ? "rgba(120,180,255,0.9)"
                                    : "rgba(120,180,255,0.4)",
                              }}
                              transition={{
                                delay: i * 0.05,
                              }}
                            />
                          ))}
                          {toast.markers > 10 && (
                            <span className="ml-1 text-[10px] text-muted-foreground/60">
                              +{toast.markers - 10}
                            </span>
                          )}
                        </div>
                      )}

                      {toast.action && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toast.action?.onClick();
                          }}
                          className="mt-1.5 inline-block text-[11px] font-medium text-primary hover:underline"
                        >
                          {toast.action.label}
                        </button>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDismiss(toast.id);
                    }}
                    className="flex size-5 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                    aria-label="Dismiss toast"
                  >
                    <X className="size-3.5" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Expand/collapse action button */}
          {!expanded && toasts.length > maxVisible && (
            <motion.button
              type="button"
              className={cn(
                "pointer-events-auto absolute bottom-0 right-0 h-5 w-5 rounded-full bg-muted text-muted-foreground shadow-md transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring",
                isBottom ? "bottom-2 right-2" : "top-2 right-2",
              )}
              aria-label="Show more toasts"
              initial={{ opacity: 0 }}
              animate={{ opacity: hovered || expanded ? 0 : 1 }}
              exit={{ opacity: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.92 }}
            >
              <ChevronDown
                className={cn("size-3.5", isBottom ? "rotate-180" : "rotate-0")}
              />
            </motion.button>
          )}
        </div>
      </div>
    );
  },
);

StackedToasts.displayName = "StackedToasts";
