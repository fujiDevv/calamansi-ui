"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  Check,
  Coffee,
  Layers,
  Link2,
  Moon,
  PenTool,
  Sun,
  Users,
} from "lucide-react";
import { Squircle } from "@/lib/squircle";
import { cn } from "@/lib/utils";

export type TaskItem = {
  id: string | number;
  title: string;
  completed?: boolean;
  tag?: string;
  icon?: ReactNode;
};

export type TaskWidgetVariant =
  | "calamansi"
  | "slate"
  | "citrus"
  | "black"
  | "dark";

/** The shell's corner: the widget's own large radius, or the kit's squircle. */
export type TaskWidgetCorner = "rounded" | "squircle";

export type TaskWidgetProps = {
  /** Array of task items (controlled). */
  tasks?: TaskItem[];
  /** Default task items (uncontrolled). */
  defaultTasks?: TaskItem[];
  /** Callback fired when a task checkbox is toggled. */
  onTaskToggle?: (taskId: string | number, completed: boolean) => void;
  /** Section title above task list. Default: "Today" */
  title?: string;
  /** Weather display options. */
  weather?: {
    condition?: string;
    temperature?: string;
    icon?: ReactNode;
  };
  /** Whether to show the live clock. Default: true */
  showClock?: boolean;
  /** Clock time format. Default: "12h" */
  timeFormat?: "12h" | "24h";
  /** Visual glass tint variant. Default: "calamansi" */
  variant?: TaskWidgetVariant;
  /**
   * Shell corner. Default: "rounded" — the widget's own radius, which is the
   * shape it shipped with. "squircle" swaps it for the kit's curve.
   */
  corner?: TaskWidgetCorner;
  /** Extra class names merged onto outer container. */
  className?: string;
};

const DEFAULT_TASKS: TaskItem[] = [
  {
    id: 1,
    title: "Buy a T-shirt",
    completed: true,
    icon: <Coffee className="size-5" />,
  },
  {
    id: 2,
    title: "Unsubscribe Figma",
    completed: false,
    icon: <Layers className="size-5" />,
  },
  {
    id: 3,
    title: "Meeting with Sarah",
    completed: false,
    icon: <Users className="size-5" />,
  },
  {
    id: 4,
    title: "Review PRs",
    completed: false,
    icon: <Link2 className="size-5" />,
  },
  {
    id: 5,
    title: "Update Portfolio",
    completed: false,
    icon: <PenTool className="size-5" />,
  },
];

const VARIANT_STYLES: Record<
  TaskWidgetVariant,
  {
    bg: string;
    accent: string;
    dotColor: string;
  }
> = {
  calamansi: {
    bg: "from-[#8fa37d] via-[#5c7a67] to-[#39564a] dark:from-[#1b281f] dark:via-[#16221a] dark:to-[#0e1611]",
    accent: "text-[#b4e84c] dark:text-[#b4e84c]",
    dotColor: "#b4e84c",
  },
  slate: {
    bg: "from-[#a79cb7] via-[#687396] to-[#4a5a7f] dark:from-[#1e1b4b] dark:via-[#1e293b] dark:to-[#0f172a]",
    accent: "text-amber-300 dark:text-amber-200",
    dotColor: "#f4f4f5",
  },
  citrus: {
    bg: "from-[#d69f7e] via-[#b87152] to-[#7d4128] dark:from-[#2e170c] dark:via-[#22120b] dark:to-[#140a06]",
    accent: "text-[#ff9e3d] dark:text-[#ff9e3d]",
    dotColor: "#ff9e3d",
  },
  black: {
    bg: "from-[#27272a] via-[#18181b] to-[#09090b] dark:from-[#18181b] dark:via-[#09090b] dark:to-[#000000]",
    accent: "text-zinc-200 dark:text-zinc-300",
    dotColor: "#e4e4e7",
  },
  dark: {
    bg: "from-[#27272a] via-[#18181b] to-[#09090b] dark:from-[#18181b] dark:via-[#09090b] dark:to-[#000000]",
    accent: "text-zinc-200 dark:text-zinc-300",
    dotColor: "#e4e4e7",
  },
};

/**
 * The widget's own radius, the shape it shipped with. The inset is not here — it
 * sits on the content layer, so both corners pad the widget identically.
 */
const ROUNDED_SHELL = [
  "overflow-hidden rounded-[36px] border-4 border-white/80",
  "sm:rounded-[64px] sm:border-[5px] lg:rounded-[88px] lg:border-[6px]",
  "dark:border-white/10 bg-gradient-to-br transition-colors duration-500",
].join(" ");

/** Its cast shadow, plus the two inset highlights that give the glass its depth. */
const ROUNDED_SHADOW =
  "0 32px 64px -16px rgba(0, 0, 0, 0.35), inset 0 -4px 20px 8px rgba(255, 255, 255, 0.4), inset 0 -10px 4px rgba(0, 0, 0, 0.2)";

/**
 * On the brand corner the surface is a clipped layer, so the cast shadow rides on
 * the wrapper as a filter and the insets move onto the layer itself.
 */
const SQUIRCLE_SHADOW = "drop-shadow(0 26px 44px rgba(0, 0, 0, 0.32))";
const SQUIRCLE_INSETS =
  "[box-shadow:inset_0_-4px_20px_8px_rgba(255,255,255,0.4),inset_0_-10px_4px_rgba(0,0,0,0.2)]";

/**
 * An iOS-inspired glassmorphism widget with live time, weather, and tactile interactive task cards.
 * The corner is its own large radius by default, or the kit's squircle with
 * `corner="squircle"`.
 * Design inspired by Jay Dwivedi (https://sprrrint.com/jaydwivedi).
 */
export function TaskWidget({
  tasks: controlledTasks,
  defaultTasks = DEFAULT_TASKS,
  onTaskToggle,
  title = "Today",
  weather,
  showClock = true,
  timeFormat = "12h",
  variant = "calamansi",
  corner = "rounded",
  className,
}: TaskWidgetProps) {
  const [internalTasks, setInternalTasks] = useState<TaskItem[]>(defaultTasks);
  const [activeTaskId, setActiveTaskId] = useState<string | number | null>(
    null,
  );
  const activeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [currentTime, setCurrentTime] = useState<{
    time: string;
    ampm: string;
  }>({
    time: "9:41",
    ampm: "AM",
  });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [canScroll, setCanScroll] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const filterId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const blurFilterId = `${filterId}blur`;

  const activeTasks = controlledTasks ?? internalTasks;
  const currentVariant = VARIANT_STYLES[variant] ?? VARIANT_STYLES.calamansi;

  // Live clock
  useEffect(() => {
    function updateClock() {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";

      if (timeFormat === "12h") {
        hours = hours % 12;
        hours = hours ? hours : 12;
      }

      const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
      setCurrentTime({
        time: `${hours}:${formattedMinutes}`,
        ampm: timeFormat === "12h" ? ampm : "",
      });
    }

    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, [timeFormat]);

  // Dark mode detection for ambient fallback
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkMode(media.matches);
    const listener = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  // Check scroll overflow on mount and updates
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const checkScroll = () => {
      const maxScroll = el.scrollHeight - el.clientHeight;
      setCanScroll(maxScroll > 10);
      setIsScrolled(el.scrollTop > 12);
    };
    checkScroll();
    const raf = requestAnimationFrame(checkScroll);
    return () => cancelAnimationFrame(raf);
  }, [activeTasks]);

  // Track scroll position for bottom indicator thumb and blur visibility
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const maxScroll = el.scrollHeight - el.clientHeight;
    setCanScroll(maxScroll > 10);
    setIsScrolled(el.scrollTop > 12);

    if (maxScroll <= 0) {
      setScrollProgress(0);
      return;
    }
    const progress = Math.min(1, Math.max(0, el.scrollTop / maxScroll));
    setScrollProgress(progress);
  }, []);

  // Clear active task highlight timeout on unmount
  useEffect(() => {
    return () => {
      if (activeTimeoutRef.current) {
        clearTimeout(activeTimeoutRef.current);
      }
    };
  }, []);

  const toggleTask = (taskId: string | number) => {
    setActiveTaskId(taskId);

    // Auto-remove the white highlight after 2.5 seconds
    if (activeTimeoutRef.current) {
      clearTimeout(activeTimeoutRef.current);
    }
    activeTimeoutRef.current = setTimeout(() => {
      setActiveTaskId((current) => (current === taskId ? null : current));
    }, 2500);

    if (onTaskToggle) {
      const task = activeTasks.find((t) => t.id === taskId);
      onTaskToggle(taskId, !task?.completed);
    }
    if (!controlledTasks) {
      setInternalTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, completed: !task.completed } : task,
        ),
      );
    }
  };

  const handleKeyDown = (e: KeyboardEvent, taskId: string | number) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleTask(taskId);
    }
  };

  const completedCount = activeTasks.filter((t) => t.completed).length;
  const squircle = corner === "squircle";

  /*
    The grain and the ambient dots ride on the surface in both shapes: inside the
    squircle layer when the corner is the kit's curve, straight on the shell when
    it is the widget's own radius — where the shell is the wrapper itself.
  */
  const surface = (
    <>
      {/* SVG Grain Noise Filter Overlay */}
      <svg className="pointer-events-none absolute inset-0 size-full opacity-15 mix-blend-overlay">
        <filter id={filterId}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${filterId})`} />
      </svg>

      {/* Top Ambient Matrix Dots */}
      <div
        className="pointer-events-none absolute left-6 top-6 size-5 opacity-40 sm:left-8 sm:top-8"
        style={{
          backgroundImage: `radial-gradient(circle, ${currentVariant.dotColor} 2px, transparent 2.5px)`,
          backgroundSize: "8px 8px",
        }}
      />
    </>
  );

  return (
    <div
      className={cn(
        "relative flex w-full max-w-[780px] flex-col",
        !squircle && ROUNDED_SHELL,
        !squircle && currentVariant.bg,
        className,
      )}
      /* a clip takes a box shadow with it, so on the squircle the cast shadow is a
         filter on the wrapper instead of a box shadow on the shell */
      style={
        squircle ? { filter: SQUIRCLE_SHADOW } : { boxShadow: ROUNDED_SHADOW }
      }
    >
      {squircle ? (
        <Squircle
          className={cn(
            "bg-gradient-to-br transition-colors duration-500",
            SQUIRCLE_INSETS,
            currentVariant.bg,
          )}
          border="text-white/80 dark:text-white/10"
          borderWidth={4}
          /* the widget casts the shadow above, so the kit's lift would double it */
          lift={false}
        >
          {surface}
        </Squircle>
      ) : (
        surface
      )}

      {/*
        Main Content Layout. The shell's inset lives here rather than on the shell:
        in the squircle mode the surface is a layer rather than the layout box, and
        padding a parent with no painted background would simply be the same box.
      */}
      <div className="relative flex flex-col justify-between p-5 sm:p-8 lg:p-10">
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-8">
          {/* Left Column: Weather and Live Clock */}
          <div className="flex flex-col justify-end select-none pt-2 sm:pt-6 md:pt-10">
            {/* Weather Row */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              {weather?.icon ??
                (isDarkMode ? (
                  <Moon className="size-5 text-slate-100 drop-shadow-sm sm:size-6" />
                ) : (
                  <Sun
                    className={cn(
                      "size-5 drop-shadow-sm sm:size-6",
                      currentVariant.accent,
                    )}
                  />
                ))}
              <span className="text-xs font-bold tracking-wider text-white/90 uppercase sm:text-base">
                {weather?.condition ?? (isDarkMode ? "Starry" : "Sunny")}
              </span>
              {weather?.temperature && (
                <span className="text-xs font-semibold text-white/70 sm:text-base">
                  {weather.temperature}
                </span>
              )}
            </div>

            {/* Large Clock Display */}
            {showClock && (
              <div className="mt-1 flex items-baseline gap-1.5 font-runde">
                <h1 className="text-5xl font-bold tracking-tight text-white drop-shadow-md sm:text-7xl lg:text-8xl tabular-nums">
                  {currentTime.time}
                </h1>
                {currentTime.ampm && (
                  <span className="text-xl font-bold tracking-tight text-white/90 sm:text-3xl">
                    {currentTime.ampm}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Task Deck */}
          {/*
          min-w-0 is load-bearing: the column is flex-basis 0, so without it the deck is pinned to its
          min-content width and a wider clock (switching 12h to 24h) overflows the row, pushing the
          deck past the card's overflow-hidden edge.
        */}
          <div className="flex min-w-0 flex-1 flex-col w-full md:max-w-[420px]">
            {/* Section Header */}
            <div className="mb-2.5 flex items-center justify-between px-1.5 select-none sm:mb-3 sm:px-2">
              <h2 className="text-xs font-bold tracking-wider text-white/60 uppercase sm:text-sm">
                {title}
              </h2>
              <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold text-white/80 backdrop-blur-xs">
                {completedCount}/{activeTasks.length}
              </span>
            </div>

            {/* Scrollable Tasks Container with Overflow Blur */}
            <div className="relative overflow-visible">
              <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex max-h-[250px] flex-col gap-2.5 overflow-y-auto p-1 pr-1.5 scroll-smooth [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.25)_transparent] sm:max-h-[280px] sm:gap-3 sm:pr-2"
              >
                {activeTasks.map((task, index) => {
                  const isActive = activeTaskId === task.id;
                  const isChecked = Boolean(task.completed);
                  const hasItemBlur = canScroll && index >= 1;
                  const isHalfBlur = index === 1;
                  const itemFilterId = `${blurFilterId}-${String(task.id).replace(/[^a-zA-Z0-9]/g, "")}`;

                  return (
                    <div
                      key={task.id}
                      role="checkbox"
                      aria-checked={isChecked}
                      tabIndex={0}
                      onClick={() => toggleTask(task.id)}
                      onKeyDown={(e) => handleKeyDown(e, task.id)}
                      className={cn(
                        "group relative flex h-16 w-full shrink-0 cursor-pointer items-center justify-between gap-3 overflow-hidden rounded-2xl px-4 transition-all duration-300 sm:h-20 sm:gap-3.5 sm:rounded-3xl sm:px-6",
                        "border backdrop-blur-md outline-hidden focus-visible:ring-2 focus-visible:ring-white/80",
                        isActive
                          ? "border-white/70 bg-white/80 text-foreground shadow-lg dark:border-white/20 dark:bg-white/15 dark:text-white"
                          : "border-white/30 bg-white/45 text-foreground/80 opacity-90 hover:border-white/60 hover:bg-white/65 hover:opacity-100 dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10",
                      )}
                      style={{
                        boxShadow: isActive
                          ? "inset 0 2px 2px rgba(255, 255, 255, 0.8), 0 10px 24px -4px rgba(0, 0, 0, 0.12)"
                          : "inset 0 1px 1px rgba(255, 255, 255, 0.3)",
                      }}
                    >
                      {/* Custom Tactile Checkbox */}
                      <div
                        className={cn(
                          "relative z-0 flex size-8 shrink-0 items-center justify-center rounded-xl border-2 transition-all duration-200 sm:size-9",
                          isChecked
                            ? "border-primary bg-primary text-primary-foreground shadow-xs dark:border-primary dark:bg-primary"
                            : "border-foreground/40 bg-transparent dark:border-white/40",
                        )}
                      >
                        {isChecked && (
                          <motion.div
                            initial={
                              shouldReduceMotion
                                ? false
                                : { scale: 0.5, opacity: 0 }
                            }
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 30,
                            }}
                          >
                            <Check className="size-4 stroke-[3.5] sm:size-5" />
                          </motion.div>
                        )}
                      </div>

                      {/* Task Title */}
                      <span
                        className={cn(
                          "relative z-0 flex-1 truncate text-sm font-semibold tracking-tight transition-colors duration-200 sm:text-lg",
                          isChecked &&
                            "text-foreground/40 line-through decoration-foreground/30 dark:text-white/40 dark:decoration-white/30",
                        )}
                      >
                        {task.title}
                      </span>

                      {/* Task Icon / Slot */}
                      {task.icon && (
                        <div
                          className={cn(
                            "relative z-0 shrink-0 transition-opacity duration-200",
                            isChecked
                              ? "opacity-30"
                              : "opacity-75 group-hover:opacity-100",
                          )}
                        >
                          {task.icon}
                        </div>
                      )}

                      {/* In-Item Grainy Glass Blur Effect (Contained strictly inside item) */}
                      {hasItemBlur && (
                        <motion.div
                          aria-hidden="true"
                          initial={false}
                          animate={
                            shouldReduceMotion
                              ? { opacity: !canScroll || isScrolled ? 0 : 1 }
                              : {
                                  opacity: !canScroll || isScrolled ? 0 : 1,
                                  y:
                                    !canScroll || isScrolled
                                      ? isHalfBlur
                                        ? 6
                                        : 10
                                      : 0,
                                }
                          }
                          transition={{
                            duration: 0.35,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                          className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-2xl sm:rounded-3xl"
                          style={{
                            backdropFilter: isHalfBlur
                              ? "blur(10px)"
                              : "blur(16px)",
                            WebkitBackdropFilter: isHalfBlur
                              ? "blur(10px)"
                              : "blur(16px)",
                            maskImage: isHalfBlur
                              ? "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0) 65%)"
                              : "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 100%)",
                            WebkitMaskImage: isHalfBlur
                              ? "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0) 65%)"
                              : "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 100%)",
                          }}
                        >
                          {/* Tactile Sandblasted Grain Noise Filter */}
                          <svg className="pointer-events-none absolute inset-0 size-full opacity-55 mix-blend-overlay">
                            <filter id={itemFilterId}>
                              <feTurbulence
                                type="fractalNoise"
                                baseFrequency="0.85"
                                numOctaves="3"
                                stitchTiles="stitch"
                              />
                              <feColorMatrix type="saturate" values="0" />
                            </filter>
                            <rect
                              width="100%"
                              height="100%"
                              filter={`url(#${itemFilterId})`}
                            />
                          </svg>

                          {/* Ambient Glass Tint Layer */}
                          <div
                            className={cn(
                              "size-full",
                              isHalfBlur
                                ? "bg-gradient-to-t from-black/25 via-white/10 to-transparent dark:from-black/45 dark:via-white/5"
                                : "bg-gradient-to-t from-black/40 via-white/10 to-white/5 dark:from-black/60 dark:via-white/5",
                            )}
                          />
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Symmetrical Home Indicator Bar */}
        <div className="relative z-10 mt-5 flex justify-center sm:mt-6">
          <div className="h-1.5 w-32 rounded-full bg-white/20 p-0.5 backdrop-blur-xs sm:w-36">
            <motion.div
              className="h-full rounded-full bg-white shadow-xs"
              style={{
                width: `${Math.round(45 + scrollProgress * 55)}%`,
                margin: "0 auto",
              }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
