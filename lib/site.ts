/**
 * ─────────────────────────────────────────────────────────────────────────────
 * CALAMANSI BRAND CONFIG
 *
 * Everything identity-related for the site lives here. Change a value and the
 * whole site follows: page titles, Open Graph tags, JSON-LD, sitemap,
 * robots.txt, llms.txt, the footer, the highlights card and the install command
 * shown across the site.
 *
 * SITE_URL is the one value still waiting on a decision — point it at the real
 * domain before deploying.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const SITE_URL = "https://calamansi-ui.dev";

export const SITE_DOMAIN = "calamansi-ui.dev";

export const SITE_NAME = "Calamansi UI";

export const SITE_SHORT_NAME = "Calamansi UI";

export const SITE_ALT_NAMES = [
  "Calamansi UI",
  "calamansi-ui",
  "Calamansi UI Components",
  "calamansi-ui.dev",
];

export const SITE_TAGLINE = "Calamansi UI - Animated React Components";

export const SITE_DESCRIPTION =
  "Calamansi UI is a free, open-source registry of animated React components with a little sour. A tiny citrus UI kit for React and Next.js, built with Tailwind CSS, Motion, and the shadcn CLI.";

export const SITE_REPO = "https://github.com/fujiDevv/calamansi-ui";

export const SITE_AUTHOR = {
  name: "Joshua Sarmiento",
  url: "https://github.com/fujiDevv",
  handle: "@fujidevv02",
};

export const SITE_CONTACT_EMAIL = "fujidevv@duck.com";

/**
 * Every public profile, keyed so the footer, highlights and JSON-LD all point
 * at the same place. `repo` is the registry itself; the rest are the author.
 */
export const SITE_LINKS = {
  repo: SITE_REPO,
  github: "https://github.com/fujiDevv",
  x: "https://x.com/fujidevv02",
  linkedin: "https://www.linkedin.com/in/joshuasarmiento/",
  email: `mailto:${SITE_CONTACT_EMAIL}`,
} as const;

export const SITE_SOCIAL_LINKS = [
  SITE_LINKS.repo,
  SITE_LINKS.github,
  SITE_LINKS.x,
  SITE_LINKS.linkedin,
] as const;
