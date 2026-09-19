"use client";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * SITE SOUND
 *
 * The site's little interface sounds — the mascot's pop, the theme toggle, and the
 * tick a copy makes — kept in one module so a single switch turns them all off and
 * one key remembers the choice.
 *
 * Every sound is fired from a real gesture (a press, a click), never on load, so
 * nothing plays before the reader has touched the page. The preference lives in
 * `localStorage` under the same shape the theme uses, and the enabled flag is a
 * plain module value subscribed to with `useSyncExternalStore`, which is what lets
 * the toggle and the players agree without a context provider.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type SfxName = "pop" | "toggle" | "tick";

const SOURCES: Record<SfxName, string> = {
  pop: "/sounds/pop.wav",
  toggle: "/sounds/toggle.wav",
  tick: "/sounds/tick.wav",
};

/** Per-sound level, so the pop leads and the tick stays out of the way. */
const LEVELS: Record<SfxName, number> = {
  pop: 0.4,
  toggle: 0.32,
  tick: 0.24,
};

const STORAGE_KEY = "calamansi-sound";

let enabled = true;
let hydrated = false;
const listeners = new Set<() => void>();
const clips = new Map<SfxName, HTMLAudioElement>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function getSfxEnabled() {
  return enabled;
}

export function subscribeSfx(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

/** Reads the remembered choice once, on the client, after mount. */
export function loadSfxPreference() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "off") enabled = false;
    else if (stored === "on") enabled = true;
  } catch {
    // storage blocked: the default stands
  }

  notify();
}

export function setSfxEnabled(next: boolean) {
  enabled = next;
  hydrated = true;

  try {
    window.localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
  } catch {
    // storage blocked: the choice still holds for this session
  }

  notify();
}

function clip(name: SfxName) {
  let audio = clips.get(name);

  if (!audio) {
    audio = new Audio(SOURCES[name]);
    audio.preload = "auto";
    clips.set(name, audio);
  }

  return audio;
}

export type SfxOptions = {
  /** Pitch shift in cents; a plain `<audio>` reaches it through its rate. */
  detune?: number;
  /** Override the clip's level, 0 to 1. */
  volume?: number;
};

/**
 * Plays one of the clips, if sound is on. A fresh node each time so a fast pair of
 * presses overlaps instead of cutting the first one off.
 */
export function playSfx(name: SfxName, options?: SfxOptions) {
  if (!enabled || typeof window === "undefined") return;

  try {
    const node = clip(name).cloneNode(true) as HTMLAudioElement;
    node.volume = options?.volume ?? LEVELS[name];

    if (options?.detune) {
      // cents to a rate multiple, clamped so nothing turns into a chipmunk
      node.playbackRate = Math.min(
        4,
        Math.max(0.25, 2 ** (options.detune / 1200)),
      );
    }

    void node.play().catch(() => {
      // a browser that refuses playback (no gesture yet) simply stays quiet
    });
  } catch {
    // no Audio support: silence, not an error
  }
}

/**
 * A pitch that climbs gently the further down a list you are, in cents — so a hover
 * run reads as one rising gesture rather than the same blip repeated.
 */
export function progressionDetune(step: number, perStep = 22, max = 620) {
  return Math.min(max, Math.max(0, step) * perStep);
}

/** Warms the three clips so the first press is not waiting on a fetch. */
export function primeSfx() {
  if (typeof window === "undefined") return;

  (Object.keys(SOURCES) as SfxName[]).forEach((name) => {
    try {
      clip(name).load();
    } catch {
      // nothing to do
    }
  });
}
