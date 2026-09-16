"use client";

let cachedStars: number | null = null;
let starsRequest: Promise<number | null> | null = null;

export function formatStars(stars: number) {
  if (stars < 1000) return String(stars);
  return `${(stars / 1000).toFixed(stars < 10000 ? 1 : 0)}k`;
}

export function getGithubStars() {
  starsRequest ??= fetch("/api/github-stars", { cache: "force-cache" })
    .then((response) => (response.ok ? response.json() : null))
    .then((data) => {
      cachedStars = typeof data?.stars === "number" ? data.stars : null;
      return cachedStars;
    })
    .catch(() => null);

  return starsRequest;
}

export function getCachedGithubStars() {
  return cachedStars;
}
