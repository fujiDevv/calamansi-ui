"use client";

import {
  forwardRef,
  useRef,
  useState,
  useEffect,
  useCallback,
  type ChangeEvent,
  type KeyboardEvent,
  type ReactNode,
  useImperativeHandle,
} from "react";
import { ArrowUp, Paperclip, Square } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

export type PromptInputProps = {
  /** Input placeholder string. Default: "Ask anything or type a prompt..." */
  placeholder?: string;
  /** Controlled value. */
  value?: string;
  /** Default value for uncontrolled usage. */
  defaultValue?: string;
  /** Callback fired when text changes. */
  onChange?: (value: string) => void;
  /** Callback fired when user submits prompt (via button or Enter). */
  onSubmit?: (value: string) => void;
  /** Callback fired when user requests to cancel / stop generating. */
  onStop?: () => void;
  /** Loading or streaming state. Replaces submit arrow with stop button / spinner. */
  isLoading?: boolean;
  /** Disables input and actions. */
  disabled?: boolean;
  /** Maximum lines before scrolling inside textarea. Default: 6 */
  maxLines?: number;
  /** Optional model selector pill or custom badge rendered in the header. */
  modelSelector?: ReactNode;
  /** Optional custom action buttons rendered on the left of the action bar. */
  actions?: ReactNode;
  /** Optional custom CSS classes merged onto outer container. */
  className?: string;
  /** Optional breathing bar under the textarea while typing. Default: true */
  breathingBar?: boolean;
  /** Optional number of magnetic particles to show while loading. Default: 6 */
  particleCount?: number;
};

export type PromptInputRef = {
  focus: () => void;
  clear: () => void;
  setValue: (val: string) => void;
};

/**
 * An AI prompt field with a restrained nebula header, breathing bar, and
 * magnetic loading particles that stay inside the action row so they never
 * overlap the typed text.
 */
export const PromptInput = forwardRef<PromptInputRef, PromptInputProps>(
  function PromptInput(
    {
      placeholder = "Ask anything or type a prompt...",
      value,
      defaultValue = "",
      onChange,
      onSubmit,
      onStop,
      isLoading = false,
      disabled = false,
      maxLines = 6,
      modelSelector,
      actions,
      className,
      breathingBar = true,
      particleCount = 6,
    },
    ref,
  ) {
    const [internalValue, setInternalValue] = useState(defaultValue);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const currentText = value !== undefined ? value : internalValue;
    const textLength = currentText.length;
    const hasText = textLength > 0;
    const [submitFlash, setSubmitFlash] = useState(0);
    const [cadenceTick, setCadenceTick] = useState(0);

    useImperativeHandle(ref, () => ({
      focus: () => textareaRef.current?.focus(),
      clear: () => {
        if (value === undefined) setInternalValue("");
        onChange?.("");
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }
      },
      setValue: (val: string) => {
        if (value === undefined) setInternalValue(val);
        onChange?.(val);
      },
    }));

    const adjustHeight = useCallback(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.style.height = "auto";
      const maxHeight = maxLines * 24;
      el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
    }, [maxLines]);

    useEffect(() => {
      adjustHeight();
    }, [currentText, adjustHeight]);

    const lastLengthRef = useRef(textLength);

    const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value;
      if (value === undefined) setInternalValue(val);
      onChange?.(val);
      adjustHeight();

      if (val.length > lastLengthRef.current) {
        setCadenceTick((v) => Math.min(1, v + 0.25));
      } else {
        lastLengthRef.current = val.length;
      }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (isLoading) {
          onStop?.();
        } else if (currentText.trim() && !disabled) {
          onSubmit?.(currentText);
          if (value === undefined) {
            setInternalValue("");
            if (textareaRef.current) textareaRef.current.style.height = "auto";
          }
        }
      }
    };

    const handleActionClick = () => {
      if (isLoading) {
        onStop?.();
      } else if (currentText.trim() && !disabled) {
        onSubmit?.(currentText);
        if (value === undefined) {
          setInternalValue("");
          if (textareaRef.current) textareaRef.current.style.height = "auto";
        }
      }
    };

    const particles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random(),
      y: Math.random(),
      size: 2 + Math.random() * 3,
      delay: Math.random() * 0.8,
    }));

    return (
      <div
        className={cn(
          "group relative flex w-full flex-col rounded-2xl border border-border/80 bg-card p-3 shadow-xs transition-all duration-200",
          "focus-within:border-primary/60 focus-within:shadow-[0_0_20px_-8px_var(--primary)]",
          disabled && "opacity-60 pointer-events-none",
          className,
        )}
      >
        {/* Model selector row */}
        {modelSelector && (
          <motion.div
            className="mb-2 flex items-center justify-between px-1"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="relative flex items-center gap-2 pr-1">
              {/* Soft halo that sits behind the selector only */}
              <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute -left-1 -top-1 -bottom-1 -right-1 rounded-lg opacity-60"
                style={{
                  background:
                    "linear-gradient(135deg, var(--primary)/30, transparent 60%)",
                  filter: "blur(8px)",
                }}
                animate={{ opacity: [0.35, 0.65, 0.35] }}
                transition={{
                  duration: 2.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              {modelSelector}
            </div>
          </motion.div>
        )}

        {/* Breathing cadence bar */}
        {breathingBar && (
          <motion.div
            className="pointer-events-none absolute left-3 right-3 bottom-2 h-0.5 rounded-full bg-primary/20 overflow-hidden"
            aria-hidden="true"
            initial={{ scaleY: 1, originY: 0.5 }}
            animate={{
              scaleY: 0.4,
              originY: 1,
              transition: {
                duration: 1.4,
                ease: "easeInOut",
                repeat: Infinity,
              },
            }}
          />
        )}

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={currentText}
          placeholder={placeholder}
          disabled={disabled}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          className="pointer-events-auto w-full resize-none bg-transparent px-1 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/70 outline-none max-h-48 overflow-y-auto scroll-smooth"
          style={{
            scrollbarWidth: "thin",
          }}
        />

        {/* Action Bar */}
        <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/40">
          <div className="flex items-center gap-1 text-muted-foreground">
            {actions ?? (
              <button
                type="button"
                title="Attach context file"
                className="flex size-8 items-center justify-center rounded-lg hover:bg-muted hover:text-foreground transition-colors"
              >
                <motion.div
                  className="absolute inset-0 rounded-lg"
                  aria-hidden="true"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.96 }}
                >
                  <Paperclip className="relative z-10 size-4" />
                </motion.div>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden text-[11px] text-muted-foreground/60 sm:inline-block">
              Use{" "}
              <kbd className="font-mono text-[10px] rounded border border-border px-1 py-0.5">
                Shift + Enter
              </kbd>{" "}
              for newline
            </span>

            <AnimatePresence mode="wait">
              <motion.button
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                key={isLoading ? "stop" : "submit"}
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => {
                  handleActionClick();
                  if (!isLoading && hasText) {
                    setSubmitFlash(1);
                    setTimeout(() => setSubmitFlash(0), 180);
                  }
                }}
                disabled={(!hasText && !isLoading) || disabled}
                className={cn(
                  "flex size-8 items-center justify-center rounded-xl transition-colors",
                  isLoading
                    ? "bg-foreground text-background"
                    : hasText
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-muted text-muted-foreground/50",
                )}
              >
                <motion.span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-xl"
                  style={{
                    background:
                      "radial-gradient(circle at 50% 50%, var(--primary)/40, transparent 70%)",
                    mixBlendMode: "soft-light",
                  }}
                  animate={{ opacity: [0, 0.5, 0] }}
                  transition={{ duration: 0.2 }}
                />
                {isLoading ? (
                  <Square className="size-3.5 fill-current" />
                ) : (
                  <ArrowUp className="size-4 stroke-[2.5]" />
                )}
              </motion.button>
            </AnimatePresence>
          </div>

          {/* Live typing cadence tick */}
          {cadenceTick > 0 && (
            <motion.span
              aria-hidden="true"
              className="pointer-events-none shrink-0 h-1 w-1 rounded-full bg-primary/70"
              initial={{ scale: 1.4, opacity: 0.9 }}
              animate={{ scale: 0.2, opacity: 0 }}
              transition={{ duration: 0.35 }}
            />
          )}

          {/* Magnetic particles inside the action row */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                className="pointer-events-none absolute right-0 top-0 h-full w-24 overflow-hidden opacity-70"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 0.7, width: 96 }}
                exit={{ opacity: 0, width: 0 }}
                aria-hidden="true"
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  {particles.map((p) => (
                    <motion.span
                      key={p.id}
                      className="absolute rounded-full bg-primary/60"
                      initial={{
                        x: 0,
                        y: 0,
                        scale: 1,
                        opacity: 0.8,
                      }}
                      animate={{
                        x: [0, p.x * 48, 0],
                        y: [0, (p.y - 0.5) * 28, 0],
                        scale: [1, 0.72, 1],
                        opacity: [0.8, 0.15, 0.8],
                      }}
                      transition={{
                        duration: 2 + Math.random() * 2,
                        repeat: Infinity,
                        delay: p.delay,
                        ease: "easeInOut",
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  },
);
