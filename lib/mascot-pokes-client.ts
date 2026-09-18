"use client";

type PokeListener = (count: number | null) => void;

let cachedPokes: number | null = null;
let countRequest: Promise<number | null> | null = null;
const listeners = new Set<PokeListener>();

/**
 * The poke count is global, so every mounted counter — the header renders on
 * every route — has to show the same number. One module-level cache and one set
 * of listeners keeps them in sync without pulling in a store library.
 */
export function getCachedMascotPokes(): number | null {
  return cachedPokes;
}

export function subscribeMascotPokes(listener: PokeListener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

/**
 * Adopts a server total only when it is ahead of what is already on screen, so
 * pokes still in flight never make the number tick backwards.
 */
function adoptPokes(next: number) {
  if (cachedPokes !== null && next <= cachedPokes) return;

  cachedPokes = next;
  listeners.forEach((listener) => listener(cachedPokes));
}

/**
 * Loads the total once and shares the in-flight request, so the header can mount
 * on every route without hammering the endpoint.
 *
 * If the edge is unreachable — a static export or `next dev`, where worker.ts
 * never runs — it settles on zero and the count keeps moving locally.
 */
export function loadMascotPokes(): Promise<number | null> {
  if (cachedPokes !== null) return Promise.resolve(cachedPokes);
  if (countRequest) return countRequest;

  countRequest = (async () => {
    try {
      const response = await fetch("/api/mascot-pokes", {
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        const data = (await response.json()) as { pokes?: number };
        if (typeof data?.pokes === "number") {
          adoptPokes(data.pokes);
          return cachedPokes;
        }
      }
    } catch {
      // No edge endpoint available; fall through to the local count.
    }

    if (cachedPokes === null) {
      cachedPokes = 0;
      listeners.forEach((listener) => listener(cachedPokes));
    }

    return cachedPokes;
  })();

  return countRequest;
}

/**
 * Counts a poke right away and records it at the edge in the background, so the
 * header moves on the same frame as the press instead of waiting on the network.
 */
export function pokeMascot() {
  cachedPokes = (cachedPokes ?? 0) + 1;
  listeners.forEach((listener) => listener(cachedPokes));

  void (async () => {
    try {
      const response = await fetch("/api/mascot-pokes", { method: "POST" });
      if (!response.ok) return;

      const data = (await response.json()) as { pokes?: number };
      if (typeof data?.pokes === "number") adoptPokes(data.pokes);
    } catch {
      // Offline: the optimistic count stands until the next load.
    }
  })();
}
