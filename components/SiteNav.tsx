"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Menu, Star, X } from "lucide-react";
import { GithubLogo } from "@/components/logos";
import SoundToggle from "@/components/SoundToggle";
import ThemeToggle from "@/components/ThemeToggle";
import { CalamansiMark } from "@/components/ui/calamansi";
import {
  formatStars,
  getCachedGithubStars,
  getGithubStars,
} from "@/lib/github-stars-client";
import { playSfx } from "@/lib/sfx-client";
import { SITE_REPO } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * THE FLOATING NAV
 *
 * The bar is not a strip of the page, it is a set of pills hovering over it: a
 * translucent surface, blurred and saturated behind, with the site's hairline as
 * its edge so it still reads on a black page. Nothing about it is full width —
 * the bar is an island, and the page scrolls under it.
 *
 * One highlight slides between the destinations rather than two of them lighting
 * up independently, so moving from Home to Components reads as it travelling.
 * The pill that carries it is the site's own lime held back to a tint, which is
 * what ties the bar to the brand without turning it into a row of green buttons.
 *
 * It is shared by both headers — supplying `onMenuToggle` is the one difference,
 * which adds the drawer toggle the docs shell needs on a phone.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const LINKS = [
  {
    label: "Home",
    href: "/",
    // "Components" is a long word and the one destination the bar must keep on a
    // phone, so Home is what gives way — the mark beside it already leads home.
    className: "hidden min-[400px]:inline-flex",
  },
  { label: "Components", href: "/components/calamansi", className: "" },
];

/** Docs live under /components/*, so that link stays lit for the whole section. */
const isCurrent = (pathname: string, href: string) =>
  href === "/components/calamansi"
    ? pathname.startsWith("/components") || pathname.startsWith("/docs")
    : pathname === href;

/** The spring the highlight and the label move on. */
const SPRING = { type: "spring", stiffness: 400, damping: 30 } as const;

/** The bar's own settle as the page starts to move under it. */
const DRIFT = {
  type: "spring",
  stiffness: 320,
  damping: 24,
  mass: 0.8,
} as const;

/**
 * The glass itself. `pointer-events-auto` is on the pills rather than the row
 * that holds them, so the space between them stays click-through.
 */
const PILL =
  "pointer-events-auto relative flex items-center rounded-full border border-border/60 bg-background/70 shadow-[0_14px_34px_-16px_rgba(0,0,0,0.45)] backdrop-blur-xl backdrop-saturate-150 dark:border-white/10 dark:bg-white/[0.07] dark:shadow-[0_14px_34px_-16px_rgba(0,0,0,0.95)]";

/** A pill holding one glyph: square on a phone, larger (and roomier) from sm. */
const ICON_PILL =
  "h-8 w-8 shrink-0 justify-center text-muted-foreground transition-colors duration-200 hover:text-foreground sm:h-10 sm:w-10 [&_svg]:size-4";

/** A pill holding a word. */
const LINK_PILL =
  "h-8 gap-0 select-none px-3 text-sm font-medium transition-colors duration-200 sm:h-10 sm:px-4";

/**
 * The travelling highlight: the lime held back to a tint so the label still
 * carries the contrast, plus the inset hairline that makes a glass bump read as
 * a raised panel rather than a flat fill.
 */
const BUMP =
  "absolute inset-0 rounded-full bg-primary/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5),inset_0_-1px_2px_0_rgba(0,0,0,0.04)] dark:bg-primary/25 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),inset_0_-1px_2px_0_rgba(0,0,0,0.3)]";

export default function SiteNav({
  menuOpen = false,
  onMenuToggle,
}: {
  /** Whether the docs drawer is open — only meaningful with `onMenuToggle`. */
  menuOpen?: boolean;
  /**
   * Supplying this adds the drawer toggle. The marketing pages have no drawer,
   * so they simply do not pass it.
   */
  onMenuToggle?: (open: boolean) => void;
}) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion() === true;
  // The nav mounts once per page, but a route change can briefly overlap two
  // headers — scope the highlight's shared layout to this instance.
  const bumpId = useId();
  const [hovered, setHovered] = useState<string | null>(null);
  const [pressed, setPressed] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [stars, setStars] = useState<number | null>(getCachedGithubStars());

  useEffect(() => {
    let cancelled = false;

    getGithubStars().then((value) => {
      if (!cancelled) setStars(value);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // Tuck the bar in once the page moves, so it reads as a layer above the
  // content instead of a fixture pinned to the top of it.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // A press released anywhere clears, so dragging off a pill cannot leave the
  // highlight stuck in its pressed shape.
  useEffect(() => {
    if (!pressed) return;

    const release = () => setPressed(null);
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    return () => {
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
    };
  }, [pressed]);

  return (
    <>
      {/*
        The bar floats, so it reserves its own height in the flow instead of
        taking it from the content. Keeping it at the old header's height is
        load-bearing: the docs rail sticks at top-16 / sm:top-20, and every
        page's first section starts below this.
      */}
      <div aria-hidden="true" className="h-16 shrink-0 sm:h-20" />

      <div className="pointer-events-none fixed inset-x-0 top-3 z-40 sm:top-5">
        <motion.nav
          aria-label="Primary"
          onMouseLeave={() => setHovered(null)}
          animate={{
            scale: reduceMotion || !scrolled ? 1 : 0.98,
            y: reduceMotion || !scrolled ? 0 : -4,
          }}
          transition={DRIFT}
          className="relative mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-4 sm:px-6"
        >
          {/* the drawer toggle first, then the mark */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {onMenuToggle && (
              <button
                type="button"
                onClick={() => onMenuToggle(!menuOpen)}
                aria-label="Toggle navigation menu"
                aria-expanded={menuOpen}
                className={cn(PILL, ICON_PILL, "md:hidden")}
              >
                {menuOpen ? <X /> : <Menu />}
              </button>
            )}

            <Link
              href="/"
              aria-label="Calamansi UI home"
              className={cn(PILL, LINK_PILL, "gap-2 px-2.5 sm:px-3.5")}
            >
              <CalamansiMark className="size-4 shrink-0 text-primary sm:size-5" />
              <span className="font-runde hidden text-sm font-bold tracking-tight whitespace-nowrap sm:inline">
                Calamansi UI
              </span>
            </Link>
          </div>

          {/*
            The destinations. From md up they float on the bar's own centre line
            rather than the space between the two clusters, because the mark and
            the icon pills are not the same width — centring between them would
            sit the pair visibly off the middle.
          */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 md:absolute md:left-1/2 md:-translate-x-1/2">
            {LINKS.map((link) => {
              const current = isCurrent(pathname, link.href);
              // hover wins over the current page while the pointer is in the bar
              const bumped = hovered ? hovered === link.href : current;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  draggable={false}
                  aria-current={current ? "page" : undefined}
                  onClick={() => playSfx("tick")}
                  onMouseEnter={() => setHovered(link.href)}
                  onPointerDown={() => {
                    setPressed(link.href);
                    setHovered(link.href);
                  }}
                  className={cn(
                    PILL,
                    LINK_PILL,
                    link.className,
                    current || bumped
                      ? "text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  <AnimatePresence>
                    {bumped && (
                      <motion.span
                        layoutId={bumpId}
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: 1,
                          scaleX: pressed ? 1.22 : 1,
                          scaleY: pressed ? 1.28 : 1,
                        }}
                        exit={{ opacity: 0 }}
                        transition={SPRING}
                        className={BUMP}
                      />
                    )}
                  </AnimatePresence>

                  <motion.span
                    animate={{ scale: pressed === link.href ? 1.08 : 1 }}
                    transition={SPRING}
                    className="relative inline-block"
                  >
                    {link.label}
                  </motion.span>
                </Link>
              );
            })}
          </div>

          {/* the outside world, then the site's two switches */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <a
              href={SITE_REPO}
              target="_blank"
              rel="noreferrer"
              aria-label="Calamansi UI on GitHub"
              // The repo link is the bar's one control that leads off the site,
              // and it is in the footer on every page — so it is what stands
              // down while the row is tight, which is what lets the docs bar
              // keep its drawer toggle beside the destinations.
              className={cn(
                PILL,
                ICON_PILL,
                "hidden md:flex md:w-auto md:px-3",
              )}
            >
              <GithubLogo className="size-4 shrink-0" />
              {stars != null && (
                <span className="hidden items-center gap-1 text-xs tabular-nums md:inline-flex">
                  <Star className="size-3 fill-current" aria-hidden="true" />
                  {formatStars(stars)}
                </span>
              )}
            </a>

            <SoundToggle className={cn(PILL, ICON_PILL)} />
            <ThemeToggle className={cn(PILL, ICON_PILL)} />
          </div>
        </motion.nav>
      </div>
    </>
  );
}
