"use client";

import {
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export type SegmentedTabItem =
  | string
  | {
      id: string;
      label: ReactNode;
      icon?: ReactNode;
      badge?: string | number;
      disabled?: boolean;
    };

export type SegmentedTabsProps = {
  /** Array of string labels or tab configuration objects. */
  items: SegmentedTabItem[];
  /** Controlled active tab ID or index string. */
  value?: string;
  /** Initial active tab for uncontrolled usage. */
  defaultValue?: string;
  /** Callback fired when the active tab changes. */
  onChange?: (value: string) => void;
  /** Size preset of the tabs. Default: "md" */
  size?: "sm" | "md" | "lg";
  /** Visual variant: "default" (recessed bar) | "pills" (floating) | "underline". Default: "default" */
  variant?: "default" | "pills" | "underline";
  /** Optional custom CSS classes merged onto container. */
  className?: string;
  /** Whether tabs react to hover with a soft magnetic glow trail. Default: true */
  magnetic?: boolean;
};

/**
 * A redesigned magnetic segmented controller.
 *
 * Design highlights:
 * - a recessed channel for the pill to travel through,
 * - the active pill acts like a magnetic lens with a moving specular shine,
 * - inactive tabs get a soft magnetic halo on hover,
 * - the active tab's label gets a subtle lift and font-press micro motion,
 * - keyboard navigation still works with arrow keys, Home, and End.
 */
export function SegmentedTabs({
  items,
  value,
  defaultValue,
  onChange,
  size = "md",
  variant = "default",
  className,
  magnetic = true,
}: SegmentedTabsProps) {
  const layoutGroupId = `segmented-${useId()}`;

  const normalizedItems = items.map((item, index) => {
    if (typeof item === "string") {
      return { id: item, label: item };
    }
    return {
      ...item,
      id: item.id || `tab-${index}`,
    };
  });

  const firstEnabledId =
    normalizedItems.find((item) => !item.disabled)?.id ||
    normalizedItems[0]?.id ||
    "";

  const [internalValue, setInternalValue] = useState<string>(
    defaultValue ?? firstEnabledId,
  );
  const activeId = value !== undefined ? value : internalValue;

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleSelect = (id: string, disabled?: boolean) => {
    if (disabled) return;
    if (value === undefined) {
      setInternalValue(id);
    }
    onChange?.(id);
  };

  const handleKeyDown = (
    e: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) => {
    const enabledIndices = normalizedItems
      .map((item, i) => (!item.disabled ? i : -1))
      .filter((i) => i !== -1);

    const pos = enabledIndices.indexOf(currentIndex);
    if (pos === -1) return;

    let targetIndex = -1;
    if (e.key === "ArrowRight") {
      targetIndex = enabledIndices[(pos + 1) % enabledIndices.length];
    } else if (e.key === "ArrowLeft") {
      targetIndex =
        enabledIndices[
          (pos - 1 + enabledIndices.length) % enabledIndices.length
        ];
    } else if (e.key === "Home") {
      targetIndex = enabledIndices[0];
    } else if (e.key === "End") {
      targetIndex = enabledIndices[enabledIndices.length - 1];
    }

    if (targetIndex !== -1) {
      e.preventDefault();
      const targetItem = normalizedItems[targetIndex];
      handleSelect(targetItem.id, targetItem.disabled);
      tabRefs.current[targetIndex]?.focus();
    }
  };

  // phone widths get tighter padding so a three-tab row still fits the screen
  const sizeClasses = {
    sm: "h-8 text-xs px-2 gap-1 sm:px-2.5 sm:gap-1.5",
    md: "h-9 text-xs px-2.5 gap-1.5 sm:text-sm sm:px-3.5 sm:gap-2",
    lg: "h-10 text-sm px-3.5 gap-1.5 sm:h-11 sm:text-base sm:px-5 sm:gap-2.5",
  };

  return (
    <div
      role="tablist"
      className={cn(
        "relative inline-flex items-center select-none",
        variant === "default" &&
          "rounded-xl border border-border/70 bg-muted/60 p-1 backdrop-blur-xs",
        variant === "pills" && "gap-1.5 p-0.5",
        variant === "underline" && "border-b border-border gap-6 px-1",
        className,
      )}
    >
      {normalizedItems.map((item, index) => {
        const isActive = item.id === activeId;

        return (
          <button
            key={item.id}
            ref={(el) => {
              tabRefs.current[index] = el;
            }}
            role="tab"
            type="button"
            aria-selected={isActive}
            disabled={item.disabled}
            tabIndex={isActive ? 0 : -1}
            onClick={() => handleSelect(item.id, item.disabled)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={cn(
              "relative flex items-center justify-center font-medium outline-none",
              sizeClasses[size],
              variant === "default" && "rounded-lg",
              variant === "pills" && "rounded-full",
              variant === "underline" && "rounded-none pb-2.5 pt-1",
              isActive
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
              item.disabled && "pointer-events-none opacity-40",
            )}
          >
            {/* Label content with lift + subtle press on active */}
            <motion.span
              className="relative z-10 flex items-center gap-1.5 leading-none"
              animate={{
                y: isActive ? [0, -0.5, 0] : 0,
              }}
              transition={{
                duration: 1.4,
                repeat: isActive ? Infinity : 0,
                ease: "easeInOut",
              }}
              whileTap={{
                scale: item.disabled ? 1 : 0.98,
                transition: { type: "spring", stiffness: 520, damping: 20 },
              }}
            >
              {item.icon && (
                <span className="shrink-0 size-4 flex items-center justify-center">
                  {item.icon}
                </span>
              )}
              {item.label}
              {item.badge !== undefined && (
                <span
                  className={cn(
                    "ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-semibold leading-tight",
                    isActive
                      ? "bg-primary/20 text-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {item.badge}
                </span>
              )}
            </motion.span>

            {/* Active indicator layer with magnetic lens feel */}
            {isActive && (
              <motion.div
                layoutId={`${layoutGroupId}-indicator`}
                className={cn(
                  "absolute inset-0 rounded-lg bg-background shadow-xs ring-1 ring-border/50",
                  variant === "pills" && "rounded-full",
                  variant === "underline" &&
                    "rounded-none h-0.5 -bottom-px left-0 right-0 top-auto",
                  variant === "underline" && "shadow-none ring-0",
                )}
                transition={{
                  type: "spring",
                  stiffness: 460,
                  damping: 30,
                }}
              >
                {/* Specular shine sweep across the pill */}
                <motion.div
                  className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden"
                  aria-hidden="true"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 45%, rgba(255,255,255,0.05) 55%, transparent 100%)",
                    opacity: 0.6,
                  }}
                  animate={{ x: [-40, 40, -40] }}
                  transition={{
                    duration: 2.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                {/* Soft outer glow halo on active */}
                {magnetic && (
                  <motion.div
                    className="pointer-events-none absolute -inset-1 rounded-[inherit] opacity-40"
                    aria-hidden="true"
                    style={{
                      background:
                        "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.18), transparent 70%)",
                    }}
                    animate={{ opacity: [0.25, 0.5, 0.25] }}
                    transition={{
                      duration: 2.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                )}

                {/* Underline variant active accent line */}
                {variant === "underline" && (
                  <motion.div
                    className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-primary/80"
                    aria-hidden="true"
                    animate={{ scaleX: [0.92, 1, 0.92] }}
                    transition={{
                      duration: 1.6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                )}
              </motion.div>
            )}

            {/* Magnetic hover halo on inactive tabs */}
            {magnetic && !isActive && !item.disabled && (
              <motion.div
                className="pointer-events-none absolute -inset-1 rounded-[inherit] opacity-0"
                aria-hidden="true"
                style={{
                  background:
                    "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.14), transparent 70%)",
                }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
