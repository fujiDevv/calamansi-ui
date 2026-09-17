"use client";

import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Brain, Check, ChevronDown, Copy, Sparkles, Timer } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

export type ThinkingStatus = "thinking" | "completed" | "idle";

export type ThinkingAccordionProps = {
  /** Current thinking state. Default: "completed" */
  status?: ThinkingStatus;
  /** Fixed elapsed duration in seconds. If omitted and status is "thinking", a live timer runs automatically. */
  duration?: number;
  /** Content of the reasoning thoughts. Can be string or custom ReactNode. */
  children?: ReactNode;
  /** Optional custom title when completed. Default: "Thought for {duration}s" */
  title?: string;
  /** Optional custom title when actively thinking. Default: "Thinking..." */
  thinkingTitle?: string;
  /** Controlled open state. */
  open?: boolean;
  /** Default open state for uncontrolled usage. Default: false */
  defaultOpen?: boolean;
  /** Callback fired when accordion open state changes. */
  onOpenChange?: (open: boolean) => void;
  /** Whether to show the copy thoughts action button. Default: true */
  showCopy?: boolean;
  /** Raw text content used when copying thoughts. If omitted, string children will be used. */
  rawText?: string;
  /** Variant style for the reasoning box. Default: "bordered" */
  variant?: "bordered" | "subtle" | "ghost";
  /** Optional custom CSS classes merged onto container. */
  className?: string;
  /** Pulse intensity for the active thinking motion. Default: normal */
  pulseIntensity?: "subtle" | "normal" | "intense";
  /** Optional count of reasoning marker dots in the header. */
  markers?: number;
};

/**
 * A redesigned thinking accordion styled as a reasoning trace viewer.
 *
 * New design language:
 * - a neural status pill with radial pulse rings and a reveal ribbon on expand,
 * - a sliding chevron that morphs into the open state,
 * - a header marker scrubber that hints at long reasoning chunks,
 * - a processing activity strip while thinking,
 * - a stronger outcome glow pulse when completed.
 */
export const ThinkingAccordion = forwardRef<
  HTMLDivElement,
  ThinkingAccordionProps
>(function ThinkingAccordion(
  {
    status = "completed",
    duration,
    children,
    title,
    thinkingTitle = "Thinking...",
    open,
    defaultOpen = false,
    onOpenChange,
    showCopy = true,
    rawText,
    variant = "bordered",
    className,
    pulseIntensity = "normal",
    markers = 6,
  },
  ref,
) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = open ?? internalOpen;

  const [elapsed, setElapsed] = useState(duration ?? 0);
  const [copied, setCopied] = useState(false);
  const [outcomeFlash, setOutcomeFlash] = useState(0);
  const [outcomeGlow, setOutcomeGlow] = useState(0);
  const [stagedReveal, setStagedReveal] = useState(0);
  const [pointerX, setPointerX] = useState(0);
  const [pointerY, setPointerY] = useState(0);

  const pulseScale =
    pulseIntensity === "subtle"
      ? 1
      : pulseIntensity === "intense"
        ? 1.28
        : 1.12;
  const pulseDuration =
    pulseIntensity === "subtle" ? 4 : pulseIntensity === "intense" ? 1.6 : 2.4;
  const pulseOpacity =
    pulseIntensity === "subtle"
      ? 0.35
      : pulseIntensity === "intense"
        ? 0.9
        : 0.65;

  // Live timer when actively thinking and no explicit duration is given
  useEffect(() => {
    if (status !== "thinking") {
      if (duration !== undefined) {
        setElapsed(duration);
      }
      return;
    }

    if (duration !== undefined) {
      setElapsed(duration);
      return;
    }

    const start = Date.now() - elapsed * 1000;
    const interval = setInterval(() => {
      setElapsed(Math.round(((Date.now() - start) / 1000) * 10) / 10);
    }, 100);

    return () => clearInterval(interval);
  }, [status, duration, elapsed]);

  // Outcome flash + glow when transitioning to completed
  useEffect(() => {
    if (status === "completed" && duration !== undefined) {
      const triggerFlash = () => {
        setOutcomeFlash(1);
        setOutcomeGlow(1);
        setTimeout(() => setOutcomeFlash(0), 1000);
        setTimeout(() => setOutcomeGlow(0), 1100);
      };
      triggerFlash();
      const repeat = setInterval(() => {
        if (status !== "completed") {
          clearInterval(repeat);
          return;
        }
        triggerFlash();
      }, 4500);
      return () => clearInterval(repeat);
    }
  }, [status, duration]);

  // Staged reveal when expanded
  useEffect(() => {
    if (!isOpen) {
      setStagedReveal(0);
      return;
    }
    const timer = setTimeout(() => setStagedReveal(1), 60);
    return () => clearTimeout(timer);
  }, [isOpen]);

  const handleToggle = () => {
    const next = !isOpen;
    if (open === undefined) {
      setInternalOpen(next);
    }
    onOpenChange?.(next);
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy =
      rawText ?? (typeof children === "string" ? children : "");
    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard write failures
    }
  };

  const formattedDuration =
    elapsed < 60
      ? `${elapsed.toFixed(elapsed % 1 === 0 ? 0 : 1)}s`
      : `${Math.floor(elapsed / 60)}m ${(elapsed % 60).toFixed(0)}s`;

  const displayTitle =
    status === "thinking"
      ? thinkingTitle
      : (title ?? `Thought for ${formattedDuration}`);

  const variantStyles = {
    bordered: "border border-border/70 bg-card/50 shadow-xs",
    subtle: "border border-transparent bg-muted/40",
    ghost: "border border-transparent bg-transparent",
  };

  return (
    <div
      ref={ref}
      onPointerMove={(e: ReactPointerEvent<HTMLDivElement>) => {
        setPointerX(e.clientX);
        setPointerY(e.clientY);
      }}
      className={cn(
        "group relative w-full overflow-hidden rounded-xl transition-colors duration-200",
        variantStyles[variant],
        className,
      )}
    >
      {/* Header Bar */}
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left text-xs select-none transition hover:bg-muted/30 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
      >
        <div className="flex min-w-0 items-center gap-2.5">
          {/* Neural status pill */}
          <div className="relative flex items-center justify-center">
            {/* Radial pulse rings */}
            {status === "thinking" && (
              <>
                <motion.div
                  className="absolute inset-0 rounded-full border border-primary/25"
                  aria-hidden="true"
                  animate={{
                    scale: [1, 1 + pulseScale * 0.35],
                    opacity: [pulseOpacity, 0],
                  }}
                  transition={{
                    duration: pulseDuration,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full border border-primary/15"
                  aria-hidden="true"
                  animate={{
                    scale: [1, 1 + pulseScale * 0.55],
                    opacity: [pulseOpacity * 0.6, 0],
                  }}
                  transition={{
                    duration: pulseDuration * 1.3,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                />
              </>
            )}

            {/* Inner status dot */}
            <div className="relative flex size-5 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
              {status === "thinking" ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 3 / pulseScale,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="size-3.5 text-primary"
                  >
                    <Sparkles className="size-3.5" />
                  </motion.div>
                  <span
                    className={cn(
                      "absolute -top-0.5 -right-0.5 flex size-2",
                      pulseIntensity !== "subtle" && "animate-ping",
                    )}
                  >
                    <span className="absolute inline-flex size-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-primary" />
                  </span>
                </>
              ) : status === "completed" ? (
                <Check className="size-3 text-emerald-500" />
              ) : (
                <Brain className="size-3 text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Title + timer */}
          <div className="flex min-w-0 items-center gap-2 truncate">
            <span className="truncate font-mono font-medium text-muted-foreground group-hover:text-foreground">
              {displayTitle}
            </span>
            {status === "thinking" && (
              <span className="shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-primary">
                {formattedDuration}
              </span>
            )}
            {status === "completed" && duration !== undefined && (
              <span className="shrink-0 rounded-full bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-emerald-500">
                done
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Header marker scrubber (dropped on phones so the title keeps its room) */}
          {markers > 0 && (
            <div className="hidden items-center gap-1 sm:flex">
              {Array.from({ length: Math.min(markers, 10) }, (_, i) => i).map(
                (i) => (
                  <motion.span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30"
                    initial={{ scale: 0 }}
                    animate={{
                      scale: 1,
                      backgroundColor:
                        i === 0
                          ? "rgba(120,180,255,0.9)"
                          : "rgba(120,180,255,0.35)",
                    }}
                    transition={{ delay: i * 0.04 }}
                    aria-hidden="true"
                  />
                ),
              )}
              {markers > 10 && (
                <span className="text-[10px] text-muted-foreground/60">
                  +{markers - 10}
                </span>
              )}
            </div>
          )}

          {showCopy && (
            <div
              role="button"
              tabIndex={0}
              onClick={handleCopy}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleCopy(e as unknown as React.MouseEvent);
                }
              }}
              title={copied ? "Copied" : "Copy thoughts"}
              className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
            >
              {copied ? (
                <Check className="size-3.5 text-primary" />
              ) : (
                <Copy className="size-3.5" />
              )}
            </div>
          )}

          {/* Sliding chevron with reveal ribbon */}
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="flex size-6 items-center justify-center text-muted-foreground"
          >
            <ChevronDown className="size-4" />
            {isOpen && (
              <motion.span
                className="pointer-events-none absolute left-2 h-0.5 rounded-full bg-primary/60"
                aria-hidden="true"
                layoutId="thinking-ribbon"
                initial={{ scaleX: 0, originX: 0 }}
                animate={{ scaleX: 1, originX: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            )}
          </motion.div>
        </div>
      </button>

      {/* Accordion Expandable Body */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
              opacity: { duration: 0.2 },
            }}
            className="overflow-hidden"
          >
            {/* Processing activity strip */}
            {status === "thinking" && (
              <div className="border-b border-border/50 bg-muted/15 px-4 py-2">
                <div className="flex items-center gap-1.5">
                  <Timer className="size-3 text-primary shrink-0" />
                  <div className="flex items-center gap-1.5 h-5">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-primary/50"
                        animate={{
                          scaleY: [0.25, 1, 0.25],
                        }}
                        transition={{
                          duration: 0.6 + i * 0.1,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: i * 0.08,
                        }}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Reasoning body with staged reveal */}
            <motion.div
              className="border-t border-border/50 bg-muted/15 px-4 py-3 text-xs leading-relaxed text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: stagedReveal ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className={cn(
                  "relative pl-3 border-l border-primary/30 font-mono text-[11px] leading-relaxed whitespace-pre-wrap break-words",
                  stagedReveal ? "opacity-100" : "opacity-0",
                )}
                style={{
                  transition: "opacity 0.35s ease",
                }}
              >
                {children}
              </div>
            </motion.div>

            {/* Outcome glow flash layer */}
            <motion.div
              className="pointer-events-none absolute inset-0 rounded-xl"
              initial={false}
              aria-hidden="true"
              style={{
                background:
                  outcomeFlash > 0 ? "rgba(120,180,255,0.22)" : "transparent",
                boxShadow:
                  outcomeGlow > 0
                    ? "0 0 30px 6px rgba(120,180,255,0.4)"
                    : "none",
              }}
              animate={{
                opacity: outcomeFlash > 0 ? [0, 0.7, 0] : 0,
                boxShadow:
                  outcomeFlash > 0
                    ? [
                        "0 0 10px 0 rgba(120,180,255,0.4)",
                        "0 0 30px 4px rgba(120,180,255,0.7)",
                        "0 0 10px 0 rgba(120,180,255,0.4)",
                      ]
                    : "none",
              }}
              transition={{
                duration: 0.5,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

ThinkingAccordion.displayName = "ThinkingAccordion";
