"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentProps,
  type RefObject,
} from "react";
import {
  motion,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
  type Transition,
} from "motion/react";
import {
  FuseFilter,
  LiquidSegment,
  LIQUID_SPRING,
  LIQUID_THRESHOLD,
  liquidMetrics,
  useFuseId,
} from "@/lib/liquid";
import { cn } from "@/lib/utils";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * THE DURATION PICKER
 *
 * Two number fields and a save button, fused into a single bar until you go to
 * edit it. Press the pen and the pieces pull apart on a real metaball thread —
 * the same fuse the Gooey nav runs — then merge back when you commit.
 *
 * The reading is the resting state: at rest the fields collapse to their digits,
 * so the whole thing reads as "2 Hr. 30 Min." rather than as three boxes waiting
 * for input. Editing expands each field to a fixed width so digits never shift
 * under the caret.
 *
 * Every segment wears the kit's corner — a share of the bar's height, which is
 * the 28px corner on the kit's 64px pill — so the seam, once open, shows the
 * brand shape on both sides of it.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** React warns about layout effects on the server; measuring is all we need it for. */
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const WIDTH_SPRING = { stiffness: 250, damping: 31 } as const;
const ERROR_SPRING = { stiffness: 700, damping: 9 } as const;
const SWAY_SPRING = { stiffness: 200, damping: 24 } as const;
const ICON_SPRING = { stiffness: 300, damping: 30 } as const;

/** How far a field is nudged when it is handed a value out of range. */
const REFUSAL = 6;

/** The filled pen and the drawn tick. One is filled, one is stroked. */
const PEN_PATH =
  "M3.78181 16.3092L3 21L7.69086 20.2182C8.50544 20.0825 9.25725 19.6956 9.84119 19.1116L20.4198 8.53288C21.1934 7.75922 21.1934 6.5049 20.4197 5.73126L18.2687 3.58024C17.495 2.80658 16.2406 2.80659 15.4669 3.58027L4.88841 14.159C4.30447 14.7429 3.91757 15.4947 3.78181 16.3092Z";
const TICK_PATH = "M4.6 12.4 9.6 17.4 19.4 7.6";

export type DurationValue = {
  hours: number;
  minutes: number;
};

export type DurationPickerVariant = "white" | "calamansi" | "slate" | "citrus";
export type DurationPickerSize = "sm" | "md" | "lg";

/**
 * The Calamansi palettes, flat rather than the family's gradients — the save
 * button is small, and the seam has to read as one colour meeting another.
 * `juice` is the same colour as a text class, so the bead follows the theme.
 */
const VARIANTS: Record<
  DurationPickerVariant,
  { paint: string; juice: string; ink: string }
> = {
  white: {
    paint: "bg-white dark:bg-[#1c1c1f]",
    juice: "text-white dark:text-[#1c1c1f]",
    ink: "text-foreground",
  },
  calamansi: {
    paint: "bg-[#5c7a67] dark:bg-[#16221a]",
    juice: "text-[#5c7a67] dark:text-[#16221a]",
    ink: "text-white",
  },
  slate: {
    paint: "bg-[#687396] dark:bg-[#1e293b]",
    juice: "text-[#687396] dark:text-[#1e293b]",
    ink: "text-white",
  },
  citrus: {
    paint: "bg-[#b87152] dark:bg-[#22120b]",
    juice: "text-[#b87152] dark:text-[#22120b]",
    ink: "text-white",
  },
};

/** The tray: the kit's hairline grey, flat so the palette is the only mark on it. */
const TRAY = "bg-border";

/**
 * Radii in the kit's share of the bar — 16 on 40, 20 on 48, 24 on 56, which is
 * 0.40 to 0.43 of the height against the 0.44 of the kit's own pill — plus how far
 * the seams open and how wide a field grows once it is live.
 *
 * The field padding is the travel plus the inset it should keep open, since the
 * surface pulls back by half the gap on the side that is opening: at `px-4` with a
 * 12px travel, a live field still shows 10px of tray beside its digits.
 */
const SIZES = {
  sm: {
    bar: "h-10",
    radius: 16,
    gap: 10,
    field: "px-3.5",
    toggle: "size-10",
    icon: "size-4",
    text: "text-sm",
    unit: "text-[11px]",
    box: 40,
  },
  md: {
    bar: "h-12",
    radius: 20,
    gap: 12,
    field: "px-4",
    toggle: "size-12",
    icon: "size-[18px]",
    text: "text-base",
    unit: "text-xs",
    box: 44,
  },
  lg: {
    bar: "h-14",
    radius: 24,
    gap: 14,
    field: "px-5",
    toggle: "size-14",
    icon: "size-5",
    text: "text-lg",
    unit: "text-sm",
    box: 48,
  },
} as const;

export type DurationPickerProps = Omit<
  ComponentProps<"div">,
  "onChange" | "defaultValue"
> & {
  /** Controlled value, in hours and minutes. */
  value?: DurationValue;
  /** Value on mount when uncontrolled. */
  defaultValue?: DurationValue;
  /** Fired on every keystroke with the clamped value. */
  onChange?: (value: DurationValue) => void;
  /** Fired when the bar is committed — the tick, or Enter in either field. */
  onConfirm?: (value: DurationValue) => void;
  /** Fired when the pieces split apart or merge back. */
  onEditingChange?: (editing: boolean) => void;
  /** Hold the bar open or shut yourself. */
  editing?: boolean;
  /** Open the bar on mount when uncontrolled. Default: false */
  defaultEditing?: boolean;
  /** Ceiling for the hours field, and the verge the input refuses to cross. Default: 24 */
  maxHours?: number;
  /** Ceiling for the minutes field. Default: 60 */
  maxMinutes?: number;
  /** Unit after the hours field. Default: "Hr." */
  hoursLabel?: string;
  /** Unit after the minutes field. Default: "Min." */
  minutesLabel?: string;
  /** Which palette the save button and the bead wear. Default: "calamansi" */
  variant?: DurationPickerVariant;
  /** Bar height, with it the corner, the travel and the field widths. Default: "md" */
  size?: DurationPickerSize;
  /** Override how far the seams open on each side, in pixels. */
  gap?: number;
  /** Override the brand corner radius in pixels. */
  radius?: number;
  /**
   * The SVG blur behind the fuse, in pixels — how far a thread reaches before it
   * severs. Defaults to 0.55 of the gap, so the thread reads the same at every size.
   */
  viscosity?: number;
  /** The alpha ramp's slope: how hard the fused edge is. Default: 19 */
  threshold?: number;
  /** Run the fuse at all. Off, the pieces simply slide apart. Default: true */
  gooey?: boolean;
  /** Leave a bead of palette juice behind when the thread severs. Default: true */
  bead?: boolean;
  disabled?: boolean;
};

/** An empty field means zero, which is why the placeholder is not the value. */
function fieldText(
  value: DurationValue | undefined,
  field: keyof DurationValue,
) {
  const n = value?.[field];
  return n === undefined || n === 0 ? "" : String(n);
}

const clampField = (raw: number, max: number) =>
  Math.min(max, Math.max(0, Math.trunc(raw) || 0));

/** The units as they read, and the names the fields are announced by. */
const DEFAULT_HOURS = "Hr.";
const DEFAULT_MINUTES = "Min.";

type DurationFieldProps = {
  value: string;
  onValueChange: (value: string) => void;
  onCommit: () => void;
  max: number;
  label: string;
  editing: boolean;
  reduced: boolean;
  disabled?: boolean;
  /** The sway the whole bar is under while the seams move. */
  sway: MotionValue<number>;
  size: DurationPickerSize;
  inputRef?: RefObject<HTMLInputElement | null>;
};

/**
 * One number, with the unit beside it. The input is a real number field but it
 * wears a collapsed width at rest, so the bar can read as a sentence — and springs
 * open to a fixed width when it is live, so digits never shift under the caret.
 */
function DurationField({
  value,
  onValueChange,
  onCommit,
  max,
  label,
  editing,
  reduced,
  disabled,
  sway,
  size,
  inputRef,
}: DurationFieldProps) {
  const preset = SIZES[size];
  const measureRef = useRef<HTMLSpanElement>(null);
  const [textWidth, setTextWidth] = useState(0);
  const refusal = useSpring(0, ERROR_SPRING);
  const x = useTransform(() => sway.get() + refusal.get());

  useIsoLayoutEffect(() => {
    if (measureRef.current) setTextWidth(measureRef.current.offsetWidth);
  }, [value, preset.text]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value;

    // out of range: take the nearest legal value and shake the field off
    if (next !== "" && (Number(next) > max || Number(next) < 0)) {
      onValueChange(String(clampField(Number(next), max)));
      if (!reduced) {
        refusal.jump(REFUSAL);
        refusal.set(0);
      }
      return;
    }

    onValueChange(next);
  };

  const collapsed = Math.max(textWidth + 12, 22);

  return (
    <>
      <motion.input
        data-slot="duration-picker-input"
        ref={inputRef}
        type="number"
        inputMode="numeric"
        value={value}
        onChange={handleChange}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            onCommit();
          }
        }}
        placeholder={editing ? "" : "0"}
        readOnly={!editing}
        disabled={disabled}
        aria-label={label}
        min={0}
        max={max}
        style={{ x }}
        animate={{ width: editing ? preset.box : collapsed }}
        transition={
          reduced ? { duration: 0 } : { type: "spring", ...WIDTH_SPRING }
        }
        className={cn(
          "h-full shrink-0 bg-transparent text-center font-semibold tabular-nums text-foreground outline-none",
          "selection:bg-primary/30",
          "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
          preset.text,
        )}
      />

      {/* the same font as the input, so the collapsed width is the digits' width */}
      <span
        ref={measureRef}
        aria-hidden="true"
        className={cn(
          "pointer-events-none invisible absolute whitespace-pre font-semibold tabular-nums",
          preset.text,
        )}
      >
        {value || "0"}
      </span>
    </>
  );
}

function DurationPicker({
  value,
  defaultValue,
  onChange,
  onConfirm,
  onEditingChange,
  editing: editingProp,
  defaultEditing = false,
  maxHours = 24,
  maxMinutes = 60,
  hoursLabel = DEFAULT_HOURS,
  minutesLabel = DEFAULT_MINUTES,
  variant = "calamansi",
  size = "md",
  gap: gapProp,
  radius: radiusProp,
  viscosity,
  threshold = LIQUID_THRESHOLD,
  gooey = true,
  bead = true,
  disabled = false,
  className,
  ...props
}: DurationPickerProps) {
  const reduced = useReducedMotion() ?? false;
  const filterId = useFuseId("duration-picker");
  const preset = SIZES[size];
  const palette = VARIANTS[variant];

  const gap = gapProp ?? preset.gap;
  const corner = radiusProp ?? preset.radius;
  const { blur, sever, seal, pull } = liquidMetrics({
    gap,
    radius: corner,
    viscosity,
  });
  // a fused edge over a moving layer is exactly what reduced motion is asking us
  // not to do, and the pieces still part on their own
  const fused = gooey && !reduced;

  const [uncontrolledEditing, setUncontrolledEditing] =
    useState(defaultEditing);
  const editing = editingProp ?? uncontrolledEditing;
  const [hours, setHours] = useState(() =>
    fieldText(value ?? defaultValue, "hours"),
  );
  const [minutes, setMinutes] = useState(() =>
    fieldText(value ?? defaultValue, "minutes"),
  );
  const hoursRef = useRef<HTMLInputElement>(null);

  /*
    A new outside value is adopted in render, not in an effect: an effect here would
    paint the stale number first and cascade a second render for it. Two guards keep
    it from fighting the caret — only a *changed* outside value counts, and a field
    already showing that number is left exactly as it is.
  */
  const [seen, setSeen] = useState(
    () => [value?.hours, value?.minutes] as const,
  );

  if (value && (value.hours !== seen[0] || value.minutes !== seen[1])) {
    setSeen([value.hours, value.minutes]);

    if (
      clampField(Number(hours), maxHours) !== clampField(value.hours, maxHours)
    ) {
      setHours(fieldText(value, "hours"));
    }
    if (
      clampField(Number(minutes), maxMinutes) !==
      clampField(value.minutes, maxMinutes)
    ) {
      setMinutes(fieldText(value, "minutes"));
    }
  }

  /*
    The fields lean into the split and settle out of it, driven by the velocity of
    the same spring the seams run on — so the digits ride the material rather than
    sitting on it. It is this bar's own spring, not the segments': the primitive
    keeps those to itself, and one more spring on the same curve stays in step.
  */
  const open = useSpring(defaultEditing ? 1 : 0, LIQUID_SPRING);
  useEffect(() => {
    const to = editing ? 1 : 0;
    if (reduced) open.jump(to);
    else open.set(to);
  }, [editing, reduced, open]);

  const velocity = useVelocity(open);
  const swayRaw = useTransform(velocity, [-3, 0, 3], [-3, 0, 3], {
    clamp: true,
  });
  const sway = useSpring(swayRaw, SWAY_SPRING);

  const toValue = (nextHours: string, nextMinutes: string): DurationValue => ({
    hours: clampField(Number(nextHours), maxHours),
    minutes: clampField(Number(nextMinutes), maxMinutes),
  });

  const applyEditing = (next: boolean) => {
    if (editingProp === undefined) setUncontrolledEditing(next);
    onEditingChange?.(next);
  };

  const commit = () => {
    applyEditing(false);
    onConfirm?.(toValue(hours, minutes));
  };

  const toggleEditing = () => {
    if (disabled) return;

    if (editing) {
      commit();
      return;
    }

    applyEditing(true);
    // the field is already in the DOM — it was read-only, not hidden
    hoursRef.current?.focus();
  };

  const handleHours = (text: string) => {
    setHours(text);
    onChange?.(toValue(text, minutes));
  };

  const handleMinutes = (text: string) => {
    setMinutes(text);
    onChange?.(toValue(hours, text));
  };

  const transition: Transition = reduced ? { duration: 0 } : ICON_SPRING;

  return (
    <div
      data-slot="duration-picker"
      data-editing={editing || undefined}
      data-disabled={disabled || undefined}
      data-variant={variant}
      className={cn(
        "relative inline-flex",
        disabled && "opacity-50",
        className,
      )}
      {...props}
    >
      <FuseFilter id={filterId} blur={blur} threshold={threshold} />

      <ul
        className={cn("relative flex items-stretch", preset.bar)}
        style={fused ? { filter: `url(#${filterId})` } : undefined}
      >
        <LiquidSegment
          seamLeft={false}
          seamRight={editing}
          atStart
          atEnd={false}
          radius={corner}
          pull={pull}
          seal={seal}
          sever={sever}
          bead={bead}
          beadFill={palette.juice}
          paint={TRAY}
          reduced={reduced}
          slot="duration-picker-segment"
          beadSlot="duration-picker-bead"
        >
          <div className={cn("flex h-full items-center gap-1", preset.field)}>
            <DurationField
              value={hours}
              onValueChange={handleHours}
              onCommit={commit}
              max={maxHours}
              label={hoursLabel === DEFAULT_HOURS ? "Hours" : hoursLabel}
              editing={editing}
              reduced={reduced}
              disabled={disabled}
              sway={sway}
              size={size}
              inputRef={hoursRef}
            />
            <motion.span
              style={{ x: sway }}
              className={cn(
                "shrink-0 font-runde text-muted-foreground",
                preset.unit,
              )}
            >
              {hoursLabel}
            </motion.span>
          </div>
        </LiquidSegment>

        <LiquidSegment
          seamLeft={editing}
          seamRight={editing}
          atStart={false}
          atEnd={false}
          radius={corner}
          pull={pull}
          seal={seal}
          sever={sever}
          bead={bead}
          beadFill={palette.juice}
          paint={TRAY}
          reduced={reduced}
          slot="duration-picker-segment"
          beadSlot="duration-picker-bead"
        >
          <div className={cn("flex h-full items-center gap-1", preset.field)}>
            <DurationField
              value={minutes}
              onValueChange={handleMinutes}
              onCommit={commit}
              max={maxMinutes}
              label={
                minutesLabel === DEFAULT_MINUTES ? "Minutes" : minutesLabel
              }
              editing={editing}
              reduced={reduced}
              disabled={disabled}
              sway={sway}
              size={size}
            />
            <motion.span
              style={{ x: sway }}
              className={cn(
                "shrink-0 font-runde text-muted-foreground",
                preset.unit,
              )}
            >
              {minutesLabel}
            </motion.span>
          </div>
        </LiquidSegment>

        <LiquidSegment
          seamLeft={editing}
          seamRight={false}
          atStart={false}
          atEnd
          radius={corner}
          pull={pull}
          seal={seal}
          sever={sever}
          bead={bead}
          beadFill={palette.juice}
          paint={cn(TRAY, editing && palette.paint)}
          reduced={reduced}
          slot="duration-picker-segment"
          beadSlot="duration-picker-bead"
        >
          <button
            type="button"
            data-slot="duration-picker-toggle"
            onClick={toggleEditing}
            disabled={disabled}
            aria-label={editing ? "Save duration" : "Edit duration"}
            aria-pressed={editing}
            className={cn(
              "flex cursor-pointer items-center justify-center transition-transform duration-200 active:scale-90 disabled:cursor-not-allowed disabled:active:scale-100",
              preset.toggle,
              editing
                ? palette.ink
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className={cn("overflow-visible", preset.icon)}
            >
              {/* the pen puts itself away as the tick draws itself on */}
              <motion.path
                d={PEN_PATH}
                fill="currentColor"
                initial={false}
                animate={{ opacity: editing ? 0 : 1, y: editing ? -3 : 0 }}
                transition={transition}
              />
              <motion.path
                d={TICK_PATH}
                fill="none"
                stroke="currentColor"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={false}
                animate={{
                  pathLength: editing ? 1 : 0,
                  opacity: editing ? 1 : 0,
                }}
                transition={transition}
              />
            </svg>
          </button>
        </LiquidSegment>
      </ul>
    </div>
  );
}

export { DurationPicker };
export default DurationPicker;
