"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { House, LayoutGrid, Menu, X } from "lucide-react";
import { Liquid } from "liquid-gooey";
import { GithubLogo } from "@/components/logos";
import SoundToggle from "@/components/SoundToggle";
import ThemeToggle from "@/components/ThemeToggle";
import { CalamansiMark } from "@/components/ui/calamansi";
import { playSfx } from "@/lib/sfx-client";
import { SITE_REPO } from "@/lib/site";
import { useMediaQuery } from "@/lib/use-media-query";
import { cn } from "@/lib/utils";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * THE NAV
 *
 * One liquid handle at the bottom of the page, and the destinations folded into
 * it. Nothing is on show until it is asked for: the mark sits on its own, and
 * pressing it bursts the icons out along an arc around it — the handle is the
 * centre of that circle, so every icon leaves along its own radius and they all
 * end up the same distance away. The middle of the arc sets off first and the
 * outer pair last, which is what makes it read as a burst rather than a row
 * sliding out. Press the handle again, click anywhere, press Escape, or take one
 * of the links, and the arc folds back in — outermost first, so it collapses
 * inward instead of replaying the opening.
 *
 * The liquid is `liquid-gooey`'s. It splits the effect in two: a silhouette layer
 * holds one blob per button behind everything, where the goo filter and the
 * shadow run, and our real buttons ride above it crisp and unfiltered — which is
 * why the icons never soften and the shadow hugs the *merged* shape. The pieces
 * are moved on `x`/`y` rather than animated by us, so the library drives the
 * element and its blob off one transition and they cannot drift apart.
 *
 * There is one arrangement, at every width: the handle is centred along the
 * bottom edge, which on a phone is where a thumb already is and on a desktop
 * keeps it out of the reading column's way.
 *
 * It is shared by both headers — supplying `onMenuToggle` is the one difference,
 * which adds the docs drawer's own button up in the corner the handle is not.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const LINKS = [
  { key: "home", label: "Home", href: "/", Icon: House },
  {
    key: "components",
    label: "Components",
    href: "/components/calamansi",
    Icon: LayoutGrid,
  },
] as const;

/** Components live under /components/*, so that icon stays lit for the section. */
const isCurrent = (pathname: string, href: string) =>
  href === "/components/calamansi"
    ? pathname.startsWith("/components") || pathname.startsWith("/docs")
    : pathname === href;

/** Asked of the query itself, so it answers the same way on the server and live. */
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * How far out each icon comes, and how long it waits its turn.
 *
 * RADIUS is how far every icon ends up from the handle, and it is the same for
 * all of them because the handle sits at the centre of the circle rather than at
 * the foot of a column. SPREAD is how far off straight-up the outermost pair
 * leans; the rest are spaced evenly between, so five icons land on an arc.
 *
 * At this radius and spread the settled arc is five unmistakable targets: 71px
 * between neighbouring centres, so 35px of clear air between the pills. The goo
 * therefore lives in the *burst*, not in the resting state — folded away every
 * icon is stacked on the handle's own seat, which is one merged blob, and each
 * one necks out of it as it leaves (measured: 72px out after the first frame,
 * overshooting to 123, settled at exactly 112). The arc is compact too: about
 * 130px of rise, against the 236px the old column reached.
 */
const RADIUS = 112;
const SPREAD = 74;
/** Left to right, in degrees off vertical: what each icon bursts out along. */
const ANGLES = [-SPREAD, -SPREAD / 2, 0, SPREAD / 2, SPREAD];
/**
 * The longest any icon waits for its turn, in ms — the outer pair, while the one
 * at the top of the arc leaves immediately. The wait is proportional to how far
 * out the icon is, and reverses on the way in.
 */
const STAGGER = 45;

/** The jelly the group travels on. The sample's own curve. */
const SWELL = {
  duration: 550,
  ease: "cubic-bezier(0.34, 1.56, 0.64, 1)",
} as const;
/** Less motion asks to be told, not travelled to. */
const SNAP = { duration: 0 } as const;

/** The liquid: one paint under every button, one shadow on the merged shape. */
const LIQUID_FILL = "var(--border)";
const LIQUID_SHADOW = "0 14px 34px -16px rgba(0, 0, 0, 0.5)";

/**
 * Every piece is its own pill, whatever the group's box is doing.
 *
 * The group has to be big enough to hold the whole open fan — that box is the
 * filter region, so anything travelling past its edge would be clipped — but the
 * *items* must not inherit that size, or each blob would be painted as a
 * 256px bar instead of a pill. So the group carries the footprint and each item is
 * pinned to a single pill at the foot of the box, which is the handle's own seat:
 * folded away, all six are stacked exactly here.
 *
 * The seat is centred by `left` rather than `-translate-x-1/2`, because the library
 * writes its own inline `transform` on this element — a Tailwind translate here
 * would simply be overwritten by it.
 */
const ITEM_BOX = "absolute bottom-0 left-[calc(50%-18px)] size-9";

/** How much a folded-away icon is still shrunk by, so the closed group is one pill. */
const FOLDED_SCALE = 0.9;

/**
 * One pill: round, icon-sized, and transparent — the liquid below is its surface,
 * so it brings no background, border or shadow of its own.
 */
const PILL =
  "pointer-events-auto flex size-9 items-center justify-center rounded-full text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-4";

/**
 * A folded-away button is faded out, and that fade is deliberately *not* on the
 * box the liquid measures: the box has to stay where it is for the blob to be
 * there to pull back in on. `transition-[color,opacity]` keeps the hover ink
 * working in the same breath.
 */
const FOLDED =
  "transition-[color,opacity] duration-200 motion-reduce:transition-none";

/** The destination you are on. */
const LIVE_INK = "text-foreground";

export default function SiteNav({
  menuOpen = false,
  onMenuToggle,
}: {
  /** Whether the docs drawer is open — only meaningful with `onMenuToggle`. */
  menuOpen?: boolean;
  /**
   * Supplying this adds the drawer button. The marketing pages have no drawer,
   * so they simply do not pass it.
   */
  onMenuToggle?: (open: boolean) => void;
}) {
  const pathname = usePathname();
  /*
    Asked of the query rather than of motion's `useReducedMotion()`, which reads
    the preference once into a `useState` and never updates it again — measured on
    this site, it reported `null` for the whole session while the query itself said
    reduce from the first script on the page.
  */
  const reduceMotion = useMediaQuery(REDUCED_MOTION_QUERY);
  const [open, setOpen] = useState(false);
  const transition = reduceMotion ? SNAP : SWELL;

  const close = () => setOpen(false);
  const onEscape = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") close();
  };
  /*
    Moving focus *within* the nav fires a blur too — React's onBlur is focusout,
    which bubbles — so tabbing from the handle into the first icon would shut the
    group it just opened. Only a blur that actually leaves the nav closes it.
  */
  const onFocusLeave = (event: React.FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) close();
  };

  /**
   * One icon of the arc, out along its own radius from the handle.
   *
   * Straight up is the reference — the sine leans it out, the cosine sets its rise
   * — so the icons trace a circle around the handle instead of a line above it.
   * The wait is proportional to how far off-centre the icon is: the one at the top
   * goes immediately, the outer pair last, and on the way in that reverses so the
   * flanks fold first.
   */
  const fanItem = (key: string, angle: number, control: ReactNode) => {
    const radians = (angle * Math.PI) / 180;
    const x = RADIUS * Math.sin(radians);
    const y = -RADIUS * Math.cos(radians);
    const outward = Math.abs(angle) / SPREAD;

    return (
      <Liquid.Item
        key={key}
        x={open ? x : 0}
        y={open ? y : 0}
        scale={open ? 1 : FOLDED_SCALE}
        transition={transition}
        delay={Math.round((open ? outward : 1 - outward) * STAGGER)}
        className={ITEM_BOX}
      >
        {/*
        Folded away, an icon is *inert*: it is sitting exactly under the handle, so
        leaving it focusable would put the whole nav in the tab order of a button
        nobody can see.
      */}
        <div className="contents" inert={!open}>
          {control}
        </div>
      </Liquid.Item>
    );
  };

  const fan = () => [
    ...LINKS.map(({ key, label, href, Icon }, index) => {
      const current = isCurrent(pathname, href);
      return fanItem(
        key,
        ANGLES[index],
        <Link
          href={href}
          aria-label={label}
          title={label}
          aria-current={current ? "page" : undefined}
          onClick={() => {
            playSfx("tick");
            close();
          }}
          className={cn(
            PILL,
            FOLDED,
            open ? "opacity-100" : "opacity-0",
            current && LIVE_INK,
          )}
        >
          <Icon />
        </Link>,
      );
    }),

    fanItem(
      "github",
      ANGLES[2],
      <a
        href={SITE_REPO}
        target="_blank"
        rel="noreferrer"
        aria-label="Calamansi UI on GitHub"
        title="Calamansi UI on GitHub"
        onClick={close}
        className={cn(PILL, FOLDED, open ? "opacity-100" : "opacity-0")}
      >
        <GithubLogo className="size-4" />
      </a>,
    ),

    /*
      The switches keep the group open: they are things you flip and check, not
      destinations you leave for.
    */
    fanItem(
      "sound",
      ANGLES[3],
      <span className="contents">
        <SoundToggle
          className={cn(
            PILL,
            FOLDED,
            open ? "opacity-100" : "opacity-0",
            "border-transparent hover:border-transparent",
          )}
        />
      </span>,
    ),
    fanItem(
      "theme",
      ANGLES[4],
      <span className="contents">
        <ThemeToggle
          className={cn(
            PILL,
            FOLDED,
            open ? "opacity-100" : "opacity-0",
            "border-transparent hover:border-transparent",
          )}
        />
      </span>,
    ),
  ];

  /**
   * Click-away. A menu you can only leave by pressing its own handle again is a
   * menu that traps you, so while it is open there is an unstyled, full-viewport
   * catcher beneath it. It sits at `z-0` inside the nav's own layer with the
   * handle lifted to `z-10` above it.
   */
  const scrim = open ? (
    <button
      type="button"
      aria-label="Close navigation"
      tabIndex={-1}
      onClick={close}
      className="pointer-events-auto fixed inset-0 z-0 cursor-default"
    />
  ) : null;

  /** The handle the whole group folds out of, and back into. */
  const trigger = (
    <Liquid.Item className={ITEM_BOX}>
      <button
        type="button"
        onClick={() => {
          playSfx("tick");
          setOpen((was) => !was);
        }}
        aria-expanded={open}
        aria-label={open ? "Close navigation" : "Open navigation"}
        title={open ? "Close navigation" : "Open navigation"}
        className={cn(PILL, FOLDED, "text-primary hover:text-primary")}
      >
        <CalamansiMark className="size-5" />
      </button>
    </Liquid.Item>
  );

  return (
    <>
      {/*
        The nav floats, so it reserves its own height in the flow instead of
        taking it from the content. Keeping the band the old header occupied is
        load-bearing: the page's first section starts below this.
      */}
      <div aria-hidden="true" className="h-16 shrink-0 sm:h-20" />

      {/*
        The way into the docs rail, up in the corner the handle is not — and above
        the catcher (`z-50` over the nav's `z-40`) so it stays pressable while the
        group is open. Pressing it closes the group as it opens the drawer, rather
        than leaving both standing.
      */}
      {onMenuToggle && (
        <div className="pointer-events-none fixed top-3 left-3 z-50 md:hidden sm:top-5">
          <button
            type="button"
            onClick={() => {
              playSfx("tick");
              close();
              onMenuToggle(!menuOpen);
            }}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            className={cn(PILL, "bg-border", menuOpen ? "text-foreground" : "")}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      )}

      {/* ── the handle, bottom centre, at every width ─────────────────────── */}
      <div className="pointer-events-none fixed bottom-5 left-1/2 z-40 -translate-x-1/2 sm:bottom-8">
        {scrim}

        <nav
          aria-label="Primary"
          data-slot="site-nav"
          className="pointer-events-auto relative z-10"
          onKeyDown={onEscape}
          onBlur={onFocusLeave}
        >
          {/*
            w-64 h-40 holds the arc's full reach — 251 × 148 is what the radius and
            spread actually need, so there is a little slack each way. The box is
            the filter region, so the goo cannot paint outside it: too small and the
            outer icons would be cut off. The handle sits at the foot of the box,
            centred, and the icons burst up and out of it from there.
          */}
          <Liquid
            fill={LIQUID_FILL}
            shadow={LIQUID_SHADOW}
            className="pointer-events-none relative h-40 w-64"
          >
            {fan()}
            {trigger}
          </Liquid>
        </nav>
      </div>
    </>
  );
}
