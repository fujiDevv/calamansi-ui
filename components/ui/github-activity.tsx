"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Transition,
} from "motion/react";
import { Squircle } from "@/lib/squircle";
import { cn } from "@/lib/utils";

export type ContributionLevel = 0 | 1 | 2 | 3 | 4;

export type Contribution = {
  date: string;
  count: number;
  level: ContributionLevel;
};

export type RepoContribution = {
  name: string;
  count: number;
  logo?: React.ReactNode;
  href?: string;
};

export type GitHubActivityVariant = "white" | "calamansi" | "slate" | "citrus";

const DEFAULT_CELL_SIZE = 11;
const DEFAULT_LABEL = "Top contributions in:";
const DEFAULT_MONTHS = 12;
const WEEKS_PER_MONTH = 365.25 / 12 / 7;
const STACK_LIMIT = 3;
const MIN_CARD_WIDTH = 320;
const MIN_LABEL_WEEKS = 3;
/**
 * The padding either side of the grid, at the widest breakpoint. The width math
 * below has to add it back.
 */
const CHROME_WIDTH = 40;

const gapFor = (cellSize: number) => Math.max(2, Math.round(cellSize / 4));
// never zero: weeks.slice(-0) would hand back the whole history instead of nothing
const weeksFor = (months: number) =>
  Math.max(1, Math.ceil(months * WEEKS_PER_MONTH));

const useIsoLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const SPRING = { type: "spring", bounce: 0.2, duration: 0.62 } as const;
const HEADER_SPRING = { ...SPRING, bounce: 0.45 } as const;
const ROW_SPRING = { ...SPRING, bounce: 0.26, delay: 0.08 } as const;
const ROW_OFFSET = 16;
const CELL_FADE = { duration: 0.2, ease: EASE_OUT } as const;
const TOOLTIP_FADE = { duration: 0.14, ease: EASE_OUT } as const;
const TOOLTIP_EDGE = 8;
const COLUMN_STAGGER = 0.012;
const LABEL_BLUR = 6;
const LABEL_REVEAL = { duration: 0.45, ease: EASE_OUT } as const;

const LEVELS = [0, 1, 2, 3, 4] as const;

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * The Calamansi surface: one flat layer, clipped to a squircle by `Squircle`,
 * with the calendar sitting straight on the palette.
 *
 * `calamansi` is the default. `white` is the other end of the range — the only
 * palette that has to read on a light page: white in light mode, near-black in
 * dark. Each palette carries the ink that sits on it, and everything inside tints
 * from `currentColor`.
 */
const SURFACE = [
  "relative max-w-full p-4 font-runde select-none",
  "sm:p-5",
].join(" ");

const VARIANTS: Record<GitHubActivityVariant, { paint: string; ink: string }> =
  {
    white: {
      paint: "bg-white dark:bg-[#1c1c1f]",
      ink: "text-foreground",
    },
    calamansi: {
      paint: [
        "bg-gradient-to-br from-[#8fa37d] via-[#5c7a67] to-[#39564a]",
        "dark:from-[#1b281f] dark:via-[#16221a] dark:to-[#0e1611]",
      ].join(" "),
      ink: "text-white",
    },
    slate: {
      paint: [
        "bg-gradient-to-br from-[#a79cb7] via-[#687396] to-[#4a5a7f]",
        "dark:from-[#1e1b4b] dark:via-[#1e293b] dark:to-[#0f172a]",
      ].join(" "),
      ink: "text-white",
    },
    citrus: {
      paint: [
        "bg-gradient-to-br from-[#d69f7e] via-[#b87152] to-[#7d4128]",
        "dark:from-[#2e170c] dark:via-[#22120b] dark:to-[#140a06]",
      ].join(" "),
      ink: "text-white",
    },
  };

/**
 * The contribution ramp each palette wears, levels 1 to 4 — level 0 stays empty
 * so the surface shows through. Used when no explicit `accent` is passed.
 *
 * The white ramp is mixed from `currentColor`, so the same four steps come out
 * dark on a light page and light on a dark one, following the surface ink.
 */
const ACCENTS: Record<GitHubActivityVariant, string[]> = {
  white: [
    "color-mix(in oklab, currentcolor 22%, transparent)",
    "color-mix(in oklab, currentcolor 45%, transparent)",
    "color-mix(in oklab, currentcolor 70%, transparent)",
    "currentcolor",
  ],
  calamansi: ["#d9f2a6", "#b4e84c", "#8fc22f", "#5f8a14"],
  slate: ["#cfc7e0", "#a79cb7", "#7a83a8", "#4a5a7f"],
  citrus: ["#ffdcb4", "#ffbc80", "#ff9e3d", "#c4691b"],
};

/** The content layer above the surface, and the space the drawer reserves. */
const CONTENT = "relative z-10 flex flex-col";

function toMonthLabels(weeks: Contribution[][]) {
  const labels: (string | null)[] = weeks.map(() => null);
  const monthAt = (index: number) => weeks[index]?.[0]?.date.slice(5, 7);

  let start = 0;
  for (let i = 1; i <= weeks.length; i++) {
    if (i < weeks.length && monthAt(i) === monthAt(start)) continue;
    // a shorter run is narrower than the label itself, so it would sit under the next month
    if (i - start >= MIN_LABEL_WEEKS) {
      labels[start] = MONTH_NAMES[Number(monthAt(start)) - 1] ?? null;
    }
    start = i;
  }

  return labels;
}

const LEVEL_OPACITY: Record<ContributionLevel, number> = {
  0: 0,
  1: 0.3,
  2: 0.52,
  3: 0.76,
  4: 1,
};

type LevelStyle = { backgroundColor: string; opacity: number };

type HoveredDay = { day: Contribution; x: number; y: number };

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function describeDay({ count, date }: Contribution) {
  const noun = count === 1 ? "contribution" : "contributions";
  return `${count} ${noun} on ${DATE_FORMAT.format(new Date(`${date}T00:00:00`))}`;
}

const CALENDAR_API = "https://github-contributions-api.jogruber.de/v4";
const EVENTS_API = "https://api.github.com/users";

type ApiDay = { date: string; count: number; level: number };
type PushEvent = {
  type: string;
  repo?: { name: string };
  payload?: { commits?: unknown[] };
};

async function fetchCalendar(login: string) {
  const res = await fetch(`${CALENDAR_API}/${login}?y=last`);
  if (!res.ok) return null;

  const days: ApiDay[] = (await res.json())?.contributions ?? [];
  if (!days.length) return null;

  // columns are weeks, so the first day has to be a sunday or every column shears
  const start = days.findIndex(
    (day) => new Date(`${day.date}T00:00:00Z`).getUTCDay() === 0,
  );

  return days.slice(start < 0 ? 0 : start).map<Contribution>((day) => ({
    date: day.date,
    count: day.count,
    level: Math.min(4, Math.max(0, day.level)) as ContributionLevel,
  }));
}

async function fetchRepos(login: string): Promise<RepoContribution[]> {
  const res = await fetch(`${EVENTS_API}/${login}/events/public?per_page=100`);
  if (!res.ok) return [];

  const events: PushEvent[] = await res.json();
  const counts = new Map<string, number>();

  for (const event of events) {
    if (event.type !== "PushEvent" || !event.repo) continue;
    const commits = event.payload?.commits?.length ?? 1;
    counts.set(event.repo.name, (counts.get(event.repo.name) ?? 0) + commits);
  }

  return [...counts.entries()]
    .sort(([, a], [, b]) => b - a)
    .slice(0, STACK_LIMIT)
    .map(([fullName, count]) => {
      const [owner, name] = fullName.split("/");
      return {
        name,
        count,
        href: `https://github.com/${fullName}`,
        // github has no repo logo, only an owner avatar, so own repos use the initial
        logo:
          owner.toLowerCase() === login.toLowerCase() ? undefined : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={`https://github.com/${owner}.png?size=64`} alt="" />
          ),
      };
    });
}

function useGitHubUser(login?: string) {
  const [data, setData] = React.useState<{
    contributions: Contribution[];
    repos: RepoContribution[];
  }>();

  React.useEffect(() => {
    if (!login) return;
    let active = true;

    Promise.all([fetchCalendar(login), fetchRepos(login)])
      .then(([contributions, repos]) => {
        if (active && contributions) setData({ contributions, repos });
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [login]);

  return data;
}

function emptyDays(weeks: number): Contribution[] {
  const today = new Date();
  return Array.from({ length: weeks * 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (weeks * 7 - 1 - i));
    return {
      date: date.toISOString().slice(0, 10),
      count: 0,
      level: 0 as ContributionLevel,
    };
  });
}

function toScale(accent: string | string[]): LevelStyle[] {
  if (typeof accent === "string") {
    return LEVELS.map((level) => ({
      backgroundColor: accent,
      opacity: LEVEL_OPACITY[level],
    }));
  }

  const colors = accent.length > 4 ? accent : ["transparent", ...accent];
  return LEVELS.map((level) => {
    const color = colors[level] ?? colors.at(-1) ?? "transparent";
    return { backgroundColor: color, opacity: color === "transparent" ? 0 : 1 };
  });
}

function toWeeks(contributions: Contribution[]) {
  const weeks: Contribution[][] = [];
  for (let i = 0; i < contributions.length; i += 7) {
    weeks.push(contributions.slice(i, i + 7));
  }
  return weeks;
}

function useFittedColumns(cellSize: number, gap: number) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [columns, setColumns] = React.useState<number>();

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    // The observer's first callback lands after layout and before paint, so the
    // grid is trimmed to the real width without a visible flash.
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? el.clientWidth;
      setColumns(Math.max(1, Math.floor((width + gap) / (cellSize + gap))));
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [cellSize, gap]);

  return [ref, columns] as const;
}

const Tooltip = ({
  hovered,
  reduceMotion,
}: {
  hovered: HoveredDay;
  reduceMotion: boolean | null;
}) => {
  const ref = React.useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Kept off the viewport edges by writing straight to the node — measuring the
    // chip is a DOM read, not React state.
    const half = el.offsetWidth / 2;
    const edge = TOOLTIP_EDGE + half;
    el.style.left = `${Math.min(Math.max(hovered.x, edge), window.innerWidth - edge)}px`;
  }, [hovered]);

  return createPortal(
    <div
      ref={ref}
      className="pointer-events-none fixed z-50"
      style={{
        left: hovered.x,
        top: hovered.y,
        transform: "translate(-50%, calc(-100% - 8px))",
      }}
    >
      <motion.div
        className="font-runde whitespace-nowrap rounded-lg bg-foreground px-2 py-1 text-[11px] font-medium text-background shadow-md"
        initial={reduceMotion ? false : { opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
        transition={reduceMotion ? { duration: 0 } : TOOLTIP_FADE}
      >
        {describeDay(hovered.day)}
      </motion.div>
    </div>,
    document.body,
  );
};

const ContributionGrid = ({
  contributions,
  scale,
  cellSize,
  months,
  showMonths,
  label,
  reduceMotion,
}: {
  contributions: Contribution[];
  scale: LevelStyle[];
  cellSize: number;
  months: number;
  showMonths: boolean;
  label: string;
  reduceMotion: boolean | null;
}) => {
  const weeks = React.useMemo(() => toWeeks(contributions), [contributions]);
  const gap = gapFor(cellSize);
  const [ref, columns] = useFittedColumns(cellSize, gap);
  const [hovered, setHovered] = React.useState<HoveredDay>();

  const cap = Math.min(weeks.length, weeksFor(months));
  const visible = weeks.slice(-Math.min(cap, columns ?? cap));
  const sweepEnd = (visible.length - 1) * COLUMN_STAGGER + CELL_FADE.duration;

  const hover = (day: Contribution) => (event: React.PointerEvent) => {
    const cell = event.currentTarget.getBoundingClientRect();
    setHovered({ day, x: cell.left + cell.width / 2, y: cell.top });
  };

  return (
    <div
      ref={ref}
      data-slot="github-activity-grid"
      role="img"
      aria-label={label}
      className="relative"
    >
      {showMonths && (
        <motion.div
          className="flex justify-center"
          style={{ gap, marginBottom: gap }}
          initial={
            reduceMotion
              ? false
              : { opacity: 0, filter: `blur(${LABEL_BLUR}px)` }
          }
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{
            ...LABEL_REVEAL,
            delay: reduceMotion ? 0 : sweepEnd,
          }}
        >
          {toMonthLabels(visible).map((month, index) => (
            <div
              key={index}
              className="relative h-3 shrink-0"
              style={{ width: cellSize }}
            >
              {month && (
                <span className="absolute top-0 left-0 text-[10px] leading-none text-current/45">
                  {month}
                </span>
              )}
            </div>
          ))}
        </motion.div>
      )}

      <div
        className="flex justify-center overflow-hidden"
        style={{ gap }}
        onPointerLeave={() => setHovered(undefined)}
      >
        {visible.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col" style={{ gap }}>
            {week.map((day) => (
              <motion.div
                key={day.date}
                onPointerEnter={hover(day)}
                className="shrink-0 rounded-[3px] bg-current/15"
                style={{ width: cellSize, height: cellSize }}
                initial={reduceMotion ? false : { opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  ...CELL_FADE,
                  delay: reduceMotion ? 0 : weekIndex * COLUMN_STAGGER,
                }}
              >
                <div
                  className="h-full w-full rounded-[3px]"
                  style={scale[day.level] ?? scale[0]}
                />
              </motion.div>
            ))}
          </div>
        ))}
      </div>

      <AnimatePresence>
        {hovered && (
          <Tooltip
            key="tooltip"
            hovered={hovered}
            reduceMotion={reduceMotion}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const Avatar = ({
  repo,
  layoutId,
  transition,
  className,
}: {
  repo: RepoContribution;
  layoutId: string;
  transition: Transition;
  className?: string;
}) => (
  <motion.span
    layoutId={layoutId}
    transition={transition}
    className={cn(
      "grid size-7 shrink-0 place-items-center overflow-hidden rounded-full bg-white/25 text-[11px] font-medium text-white uppercase ring-2 ring-white/20",
      "[&_img]:size-full [&_img]:object-cover [&_svg]:size-full",
      className,
    )}
  >
    {repo.logo ?? repo.name.charAt(0)}
  </motion.span>
);

const RepoRow = ({
  repo,
  layoutId,
  transition,
}: {
  repo: RepoContribution;
  layoutId: string;
  transition: Transition;
}) => {
  const className =
    "flex items-center gap-3 rounded-xl mx-2 px-2 py-2 transition-colors hover:bg-white/[0.14]";

  const content = (
    <>
      <Avatar repo={repo} layoutId={layoutId} transition={transition} />
      <span className="flex-1 truncate text-sm text-white">{repo.name}</span>
      <span className="text-sm tabular-nums text-white/85">{repo.count}</span>
    </>
  );

  return repo.href ? (
    <a href={repo.href} target="_blank" rel="noreferrer" className={className}>
      {content}
    </a>
  ) : (
    <div className={className}>{content}</div>
  );
};

const Chevron = ({
  open,
  transition,
}: {
  open: boolean;
  transition: Transition;
}) => (
  <motion.svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    className="size-7 text-white/70"
    initial={false}
    animate={{ rotate: open ? 180 : 0 }}
    transition={transition}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="m16 10-4 4-4-4" />
  </motion.svg>
);

export type GitHubActivityProps = React.ComponentProps<"div"> & {
  /** GitHub login to read the calendar and recent pushes from. */
  username?: string;
  /** Pre-fetched calendar. Pass it to skip the network entirely. */
  contributions?: Contribution[];
  /** Pre-fetched repository stack. */
  repos?: RepoContribution[];
  /** Year shown in the heading. Defaults to the year the data ends on. */
  year?: number;
  /** Surface palette. Default: "calamansi" */
  variant?: GitHubActivityVariant;
  /**
   * Contribution ramp, levels 1 to 4. A single colour fades through opacity
   * instead. Defaults to the ramp of the selected variant.
   */
  accent?: string | string[];
  /** Size of one day, in pixels. */
  cellSize?: number;
  /** How many months of history to show once there is room for them. */
  months?: number;
  /** Show the month labels above the grid. */
  showMonths?: boolean;
  /** Label on the repository drawer. */
  label?: string;
  /** Open the repository drawer on mount. */
  defaultOpen?: boolean;
  /** Controlled drawer state. */
  open?: boolean;
  /** Notified when the drawer opens or closes. */
  onOpenChange?: (open: boolean) => void;
};

/**
 * A year of GitHub contributions on the Calamansi surface: the calendar sits
 * straight on the palette, and the busiest repositories stack along the bottom,
 * expanding into a drawer over the grid.
 *
 * Give it a `username` and it fetches everything it needs in the browser, or pass
 * `contributions` and `repos` to drive it entirely from your own data.
 */
const GitHubActivity = ({
  className,
  username,
  contributions: contributionsProp = [],
  repos: reposProp = [],
  year,
  variant = "calamansi",
  accent,
  cellSize = DEFAULT_CELL_SIZE,
  months = DEFAULT_MONTHS,
  showMonths = false,
  label = DEFAULT_LABEL,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
  style,
  ...props
}: GitHubActivityProps) => {
  const reduceMotion = useReducedMotion();
  const uid = React.useId();
  const [openState, setOpenState] = React.useState(defaultOpen);

  const open = openProp ?? openState;
  const toggle = () => {
    if (openProp === undefined) setOpenState(!open);
    onOpenChange?.(!open);
  };

  const needsFetch = !contributionsProp.length || !reposProp.length;
  const fetched = useGitHubUser(needsFetch ? username : undefined);
  const placeholder = React.useMemo(
    () => (username ? emptyDays(weeksFor(months)) : []),
    [username, months],
  );

  const contributions = contributionsProp.length
    ? contributionsProp
    : (fetched?.contributions ?? placeholder);
  const repos = reposProp.length ? reposProp : (fetched?.repos ?? []);

  const scale = React.useMemo(
    () => toScale(accent ?? ACCENTS[variant]),
    [accent, variant],
  );
  const transition = reduceMotion ? { duration: 0 } : SPRING;
  const headerTransition = reduceMotion ? { duration: 0 } : HEADER_SPRING;
  const rowTransition = reduceMotion ? { duration: 0 } : ROW_SPRING;

  const kick = reduceMotion ? {} : { x: ROW_OFFSET, y: ROW_OFFSET };
  const listMotion = {
    initial: { opacity: 0, ...kick },
    animate: { opacity: 1, x: 0, y: 0 },
    exit: { opacity: 0, ...kick },
  };

  const total = React.useMemo(
    () => contributions.reduce((sum, day) => sum + day.count, 0),
    [contributions],
  );

  const parsedYear = Number(contributions.at(-1)?.date.slice(0, 4));
  const displayYear = year ?? (Number.isFinite(parsedYear) ? parsedYear : null);
  const heading = `${total} contributions${displayYear ? ` in ${displayYear}` : ""}`;

  const gap = gapFor(cellSize);
  const columns = Math.min(
    Math.ceil(contributions.length / 7),
    weeksFor(months),
  );
  const width = Math.max(
    MIN_CARD_WIDTH,
    columns * (cellSize + gap) - gap + CHROME_WIDTH,
  );

  return (
    <div
      data-slot="github-activity"
      data-variant={variant}
      className={cn(SURFACE, VARIANTS[variant].ink, className)}
      style={{ width, ...style }}
      {...props}
    >
      <Squircle className={VARIANTS[variant].paint} />

      <div className={cn(CONTENT, repos.length > 0 && "pb-[76px]")}>
        <p className="mb-4 px-1.5 text-base font-bold tracking-tight">
          {heading}
        </p>

        <ContributionGrid
          contributions={contributions}
          scale={scale}
          cellSize={cellSize}
          months={months}
          showMonths={showMonths}
          label={heading}
          reduceMotion={reduceMotion}
        />

        {repos.length > 0 && (
          <motion.div
            layout
            id={`${uid}-panel`}
            data-slot="github-activity-panel"
            data-state={open ? "open" : "closed"}
            className={cn(
              // sits well below the glass window, so the drawer reads as its own layer
              "absolute inset-x-2 bottom-2 overflow-hidden rounded-[18px] bg-black/65 shadow-[0_16px_36px_-16px_rgba(0,0,0,0.7)] ring-1 ring-white/25 backdrop-blur-xl",
              open && "top-2",
            )}
            transition={transition}
          >
            <motion.div
              layout="position"
              transition={headerTransition}
              className="flex items-center justify-between gap-3 px-4 py-3"
            >
              <span className="truncate text-sm font-medium text-white">
                {label}
              </span>

              <div className="flex items-center gap-3">
                {!open && (
                  <div className="flex items-center">
                    {repos.slice(0, STACK_LIMIT).map((repo, index) => (
                      <Avatar
                        key={index}
                        repo={repo}
                        layoutId={`${uid}-${index}`}
                        transition={transition}
                        className="-ml-2 first:ml-0"
                      />
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={toggle}
                  aria-expanded={open}
                  aria-controls={`${uid}-panel`}
                  aria-label={
                    open ? "Hide top repositories" : "Show top repositories"
                  }
                  className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-full bg-white/15 transition-colors hover:bg-white/25"
                >
                  <Chevron open={open} transition={transition} />
                </button>
              </div>
            </motion.div>

            <AnimatePresence initial={false} mode="popLayout">
              {open && (
                <motion.ul
                  key="list"
                  layout="position"
                  {...listMotion}
                  transition={rowTransition}
                  className="px-0.5 pb-1"
                >
                  {repos.map((repo, index) => (
                    <li key={index}>
                      <RepoRow
                        repo={repo}
                        layoutId={`${uid}-${index}`}
                        transition={transition}
                      />
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export { GitHubActivity };
export default GitHubActivity;
