/**
 * Generates every raster brand asset from inline SVG.
 *
 *   node scripts/generate-assets.mjs
 *
 * The mascot geometry is read straight out of `components/ui/calamansi.tsx`, so
 * the artwork can never drift from the component. Requires `sharp` (already a
 * transitive dependency of Next.js) and is only needed when the brand art
 * changes — the generated files are committed.
 */
import { execFile } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import path from "node:path";
import sharp from "sharp";

const run = promisify(execFile);

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = path.join(ROOT, "public");
const TMP = path.join(ROOT, ".asset-frames");

/* ── brand constants ──────────────────────────────────────────────────────── */

const RIND = "#b4e84c";
const RIND_DEEP = "#86b81f";
const LEAF = "#4e9a3e";
const BLUSH = "#ff7e9d";
const INK = "#0b0d08";
const CARD = "#0a0a0a";
const PAPER = "#f2f6e8";
const MUTED = "#98a389";
const DESTRUCTIVE = "#f04438";
const FONT = "Avenir Next, Arial Rounded MT Bold, Helvetica, Arial, sans-serif";
const MONO = "Menlo, Monaco, Consolas, monospace";

/* ── identity, pulled from lib/site.ts ───────────────────────────────────── */

const siteSource = await readFile(path.join(ROOT, "lib/site.ts"), "utf8");
const REPO_SLUG = siteSource.match(
  /SITE_REPO = "https:\/\/github\.com\/([^"]+)"/,
)?.[1];

if (!REPO_SLUG) throw new Error("Could not find SITE_REPO in lib/site.ts");

/* ── mascot geometry, pulled from the component ──────────────────────────── */

const componentSource = await readFile(
  path.join(ROOT, "components/ui/calamansi.tsx"),
  "utf8",
);

function artPath(name) {
  const match = componentSource.match(
    new RegExp(`export const ${name} =\\s*"([^"]+)"`),
  );
  if (!match) throw new Error(`Could not find ${name} in calamansi.tsx`);
  return match[1];
}

const BODY = artPath("CALAMANSI_BODY_PATH");
const STEM = artPath("CALAMANSI_STEM_PATH");
const LEAF_PATH = artPath("CALAMANSI_LEAF_PATH");

/** Content bounding box of the artwork, so it can be centred precisely. */
const ART_VIEWBOX = "21 -21 560 560";

const EYE = { left: 201.569, right: 355.842, y: 254.878, w: 54.589, h: 103.245, rx: 27.295 };
const EYE_CY = EYE.y + EYE.h / 2;
const TART_MARK = [
  "M12.97 72.225C72.246 73.8 106.759 61.286 162.243 9.5 161 69.102 72.664 125.232 12.971 72.225",
  "M183.775 12.97c-1.575 59.275 10.939 93.788 62.724 149.272C186.898 161 130.768 72.664 183.775 12.971",
  "M243.029 183.775c-59.274-1.575-93.787 10.939-149.271 62.725 1.242-59.602 89.578-115.732 149.271-62.725",
  "M72.225 243.029C73.8 183.755 61.286 149.242 9.5 93.758 69.102 95 125.232 183.336 72.225 243.029",
];

const NUM = (value) => Number(value.toFixed(3));

/**
 * A static snapshot of the mascot. Every knob maps to something the live
 * component does with GSAP, so the previews match the real thing.
 */
function mascotArt({
  uid = "m",
  eyeOpen = 1,
  eyesY = 0,
  lookX = 0,
  tartEyes = 0,
  blush = 0,
  tart = 0,
  squishX = 1,
  squishY = 1,
  rind = RIND,
  eyeColor = INK,
  leaf = LEAF,
  showEyes = true,
} = {}) {
  const eyeH = NUM(EYE.h * eyeOpen);
  const eyeRx = NUM(EYE.rx * eyeOpen);
  const eyeY = NUM(EYE.y + eyesY + (EYE.h - eyeH) / 2);
  const clipId = `${uid}-clip`;
  const glareId = `${uid}-glare`;
  const rimId = `${uid}-rim`;

  const eye = (x) => {
    const cx = NUM(x + EYE.w / 2);
    const rotate = tartEyes ? ` rotate(${tartEyes > 0 ? 14 : -14} ${cx} ${EYE_CY})` : "";
    return `<g transform="${rotate.trim()}"><rect x="${x}" y="${eyeY}" width="${EYE.w}" height="${eyeH}" rx="${eyeRx}" fill="${eyeColor}"/></g>`;
  };

  const squish =
    squishX === 1 && squishY === 1
      ? ""
      : ` transform="translate(${NUM(306 * (1 - squishX))} ${NUM(518 * (1 - squishY))}) scale(${squishX} ${squishY})"`;

  return `
  <defs>
    <clipPath id="${clipId}"><path d="${BODY}"/></clipPath>
    <radialGradient id="${glareId}" cx="36%" cy="20%" r="78%">
      <stop offset="0%" stop-color="#fff" stop-opacity=".32"/>
      <stop offset="36%" stop-color="#fff" stop-opacity=".12"/>
      <stop offset="72%" stop-color="#fff" stop-opacity=".02"/>
      <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="${rimId}" cx="50%" cy="50%" r="50%">
      <stop offset="72%" stop-color="#fff" stop-opacity="0"/>
      <stop offset="92%" stop-color="#fff" stop-opacity=".16"/>
      <stop offset="100%" stop-color="#fff" stop-opacity=".26"/>
    </radialGradient>
  </defs>
  <g${squish}>
    <path d="${STEM}" fill="${leaf}" stroke="${leaf}" stroke-width="6" stroke-linejoin="round"/>
    <path d="${LEAF_PATH}" fill="${leaf}" stroke="${leaf}" stroke-width="6" stroke-linejoin="round"/>
    <path d="${LEAF_PATH}" fill="none" opacity=".45" stroke="${RIND_DEEP}" stroke-width="5" stroke-linecap="round"/>
    <path d="${BODY}" fill="${rind}"/>
    <g clip-path="url(#${clipId})">
      <ellipse cx="244" cy="196" rx="232" ry="188" fill="url(#${glareId})"/>
      <ellipse cx="306" cy="320" rx="306" ry="252" fill="url(#${rimId})" opacity=".6"/>
    </g>
    <g transform="translate(424 116) scale(0.38)" opacity="${tart}">
      ${TART_MARK.map((d) => `<path d="${d}" fill="${DESTRUCTIVE}"/>`).join("")}
    </g>
    <path d="M142 386a36 24 0 1 0 72 0 36 24 0 1 0-72 0M398 386a36 24 0 1 0 72 0 36 24 0 1 0-72 0" fill="${BLUSH}" opacity="${blush}"/>
  </g>
  ${
    showEyes
      ? `<g transform="translate(${NUM(lookX)} 0)">
    ${eye(EYE.left)}
    ${eye(EYE.right)}
  </g>`
      : ""
  }`;
}

/* ── helpers ─────────────────────────────────────────────────────────────── */

const escapeXml = (value) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const text = (value, attrs) => `<text ${attrs}>${escapeXml(value)}</text>`;

async function render(svg, file, size) {
  const image = sharp(Buffer.from(svg));
  const pipeline = size ? image.resize(size) : image;
  await pipeline.png({ compressionLevel: 9 }).toFile(path.join(PUBLIC, file));
  console.log(`  ✓ public/${file}`);
}

/** Rounded-square app icon: dark plate + centred fruit. */
function appIconSvg(size, inset = 0.2) {
  const pad = Math.round((size * inset) / 2);
  const radius = Math.round(size * 0.22);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <defs>
      <radialGradient id="plate" cx="50%" cy="18%" r="82%">
        <stop offset="0%" stop-color="#1f2418"/>
        <stop offset="100%" stop-color="${INK}"/>
      </radialGradient>
      <radialGradient id="bloom" cx="30%" cy="16%" r="60%">
        <stop offset="0%" stop-color="${RIND}" stop-opacity=".28"/>
        <stop offset="100%" stop-color="${RIND}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${size}" height="${size}" rx="${radius}" fill="url(#plate)"/>
    <rect width="${size}" height="${size}" rx="${radius}" fill="url(#bloom)"/>
    <svg x="${pad}" y="${pad}" width="${size - pad * 2}" height="${size - pad * 2}" viewBox="${ART_VIEWBOX}">${mascotArt({ uid: `icon${size}`, eyeColor: INK })}</svg>
  </svg>`;
}

/* ── Open Graph ──────────────────────────────────────────────────────────── */

const OG_BG = `
  <defs>
    <radialGradient id="ogbloom" cx="72%" cy="34%" r="62%">
      <stop offset="0%" stop-color="${RIND}" stop-opacity=".22"/>
      <stop offset="100%" stop-color="${RIND}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="ogglow" cx="18%" cy="10%" r="70%">
      <stop offset="0%" stop-color="#2a3320" stop-opacity=".9"/>
      <stop offset="100%" stop-color="${INK}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="ogdots" width="34" height="34" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.5" fill="${RIND}" fill-opacity=".10"/>
    </pattern>
  </defs>
  <rect width="1200" height="630" fill="${INK}"/>
  <rect width="1200" height="630" fill="url(#ogdots)"/>
  <rect width="1200" height="630" fill="url(#ogglow)"/>
  <rect width="1200" height="630" fill="url(#ogbloom)"/>
  <circle cx="1035" cy="86" r="120" fill="none" stroke="${RIND}" stroke-opacity=".14" stroke-width="2"/>
  <circle cx="1035" cy="86" r="78" fill="none" stroke="${RIND}" stroke-opacity=".1" stroke-width="2"/>
`;

function ogSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    ${OG_BG}
    <svg x="700" y="105" width="420" height="420" viewBox="${ART_VIEWBOX}">${mascotArt({ uid: "og" })}</svg>

    ${text("Calamansi UI", `x="80" y="252" font-family="${FONT}" font-size="92" font-weight="700" fill="${PAPER}" letter-spacing="-2"`)}
    ${text("Components with a little sour.", `x="80" y="322" font-family="${FONT}" font-size="33" font-weight="500" fill="${RIND}"`)}
    ${text("A citrus UI kit for React and Next.js.", `x="80" y="366" font-family="${FONT}" font-size="24" font-weight="400" fill="${MUTED}"`)}

    <rect x="80" y="424" width="608" height="68" rx="34" fill="${CARD}" stroke="${RIND}" stroke-opacity=".22"/>
    <circle cx="118" cy="458" r="9" fill="${RIND}"/>
    <text x="144" y="466" font-family="${MONO}" font-size="19">
      <tspan fill="${MUTED}">npx shadcn@latest add</tspan><tspan fill="${RIND}" font-weight="700"> ${REPO_SLUG}</tspan>
    </text>
  </svg>`;
}

/** Centred variant for the Twitter card. */
function twitterSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    ${OG_BG}
    <svg x="380" y="42" width="440" height="440" viewBox="${ART_VIEWBOX}">${mascotArt({ uid: "tw" })}</svg>
    ${text("Calamansi UI", `x="600" y="548" text-anchor="middle" font-family="${FONT}" font-size="66" font-weight="700" fill="${PAPER}" letter-spacing="-1.5"`)}
    ${text("Components with a little sour.", `x="600" y="594" text-anchor="middle" font-family="${FONT}" font-size="26" font-weight="500" fill="${RIND}"`)}
  </svg>`;
}

/* ── preview video frames ────────────────────────────────────────────────── */

const lerp = (a, b, t) => a + (b - a) * Math.min(1, Math.max(0, t));
const ramp = (frame, from, to, start, end) =>
  lerp(from, to, (frame - start) / (end - start));

/** Frames that walk through every behaviour the component has. */
function previewFrameState(frame, total) {
  const seconds = (frame / total) * 6;
  const state = { eyeOpen: 1, eyesY: 0, lookX: 0, blush: 0, tart: 0, squishX: 1, squishY: 1 };

  // idle blinks at 0.8s and 1.6s
  for (const at of [12, 24]) {
    if (frame >= at && frame < at + 5) state.eyeOpen = 0.06;
    else if (frame === at + 5) state.eyeOpen = 1;
  }

  // look around: left, then right, then back to centre
  if (seconds > 2 && seconds <= 3.5) {
    if (seconds < 2.6) state.lookX = ramp(frame, 0, -46, 30, 36);
    else if (seconds < 3.1) state.lookX = ramp(frame, -46, 46, 39, 45);
    else state.lookX = ramp(frame, 46, 0, 48, 52);
  }

  // petting: blush blooms and fades
  if (seconds > 3.5 && seconds <= 4.9) {
    if (seconds < 4) state.blush = ramp(frame, 0, 1, 53, 57);
    else if (seconds < 4.5) state.blush = 1;
    else state.blush = ramp(frame, 1, 0, 67, 72);
  }

  // poking too much: tart burst, then a squash-relax
  if (seconds > 4.9) {
    state.eyeOpen = frame < 76 ? ramp(frame, 1, 0.28, 73, 76) : ramp(frame, 0.28, 1, 84, 89);
    state.tart = frame < 76 ? ramp(frame, 0, 1, 73, 76) : ramp(frame, 1, 0, 84, 89);
    if (frame >= 73 && frame < 79) {
      const t = (frame - 73) / 6;
      state.squishX = 1 + 0.1 * Math.sin(t * Math.PI);
      state.squishY = 1 - 0.1 * Math.sin(t * Math.PI);
    }
  }

  return state;
}

/* ── component previews ──────────────────────────────────────────────────── */

const FLESH = "#ff9e3d";
const CARD_BG = "#1e2417";
const CARD_LINE = "#3a442c";
const PLATE = "#2f3724";
const PLATE_INK = "#8b9377";

const clamp01 = (value) => Math.min(1, Math.max(0, value));
const smoothstep = (value) => {
  const x = clamp01(value);
  return x * x * (3 - 2 * x);
};

const rect = (x, y, w, h, r = 20, extra = "") =>
  `<rect x="${NUM(x)}" y="${NUM(y)}" width="${NUM(w)}" height="${NUM(h)}" rx="${r}" ${extra}/>`;

const bar = (x, y, w, h = 10, r = 5) =>
  rect(x, y, w, h, r, `fill="${PLATE}"`);

const glyphText = (value, x, y, size, color, anchor = "start") =>
  text(
    value,
    `x="${NUM(x)}" y="${NUM(y)}" text-anchor="${anchor}" font-family="${MONO}" font-size="${size}" font-weight="700" fill="${color}"`,
  );

/** Spotlight card: a glow sweeping across three cards, lighting their borders. */
function spotlightPreviewFrame(frame, total) {
  const t = frame / total;
  const pointerX = lerp(50, 910, smoothstep(t < 0.5 ? t * 2 : (1 - t) * 2));
  const pointerY = 330 + Math.sin(t * Math.PI * 2) * 80;

  const cards = [
    { x: 90, glow: RIND, title: "Rind" },
    { x: 380, glow: FLESH, title: "Flesh" },
    { x: 670, glow: BLUSH, title: "Blush" },
  ];
  const y = 180;
  const w = 220;
  const h = 320;
  const R = 24;

  const body = cards
    .map((card, index) => {
      const lit = pointerX > card.x - 110 && pointerX < card.x + w + 110;
      const intensity = lit ? 0.55 : 0;

      return `
    <defs>
      <clipPath id="spc${index}">${rect(card.x, y, w, h, R)}</clipPath>
      <clipPath id="spl${index}">
        <circle cx="${NUM(pointerX)}" cy="${NUM(pointerY)}" r="150"/>
      </clipPath>
      <radialGradient id="spg${index}" gradientUnits="userSpaceOnUse" cx="${NUM(pointerX)}" cy="${NUM(pointerY)}" r="230">
        <stop offset="0%" stop-color="${card.glow}" stop-opacity="${intensity}"/>
        <stop offset="70%" stop-color="${card.glow}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    ${rect(card.x, y, w, h, R, `fill="${CARD_BG}"`)}
    <g clip-path="url(#spc${index})">
      ${rect(card.x, y, w, h, R, `fill="url(#spg${index})"`)}
    </g>
    <g clip-path="url(#spl${index})">
      ${rect(card.x + 0.75, y + 0.75, w - 1.5, h - 1.5, R, `fill="none" stroke="${card.glow}" stroke-width="1.5" stroke-opacity="${lit ? 0.95 : 0}"`)}
    </g>
    ${rect(card.x + 0.75, y + 0.75, w - 1.5, h - 1.5, R, `fill="none" stroke="${CARD_LINE}"`)}
    <circle cx="${card.x + 48}" cy="${y + 54}" r="18" fill="${PLATE}"/>
    <circle cx="${card.x + 48}" cy="${y + 54}" r="6" fill="${card.glow}"/>
    ${text(card.title, `x="${card.x + 30}" y="${y + 140}" font-family="${FONT}" font-size="24" font-weight="700" fill="${PAPER}"`)}
    ${bar(card.x + 30, y + 168, 150)}
    ${bar(card.x + 30, y + 190, 116)}
    ${bar(card.x + 30, y + 212, 134)}
  `;
    })
    .join("");

  return previewStage(`<g>${body}</g>`, { uid: `sp${frame}` });
}

/** Tilt card: a card projected through real 3D rotation, with a moving sheen. */
function tiltPreviewFrame(frame, total) {
  const t = frame / total;
  const ry = ((Math.sin(t * Math.PI * 2) * 26) * Math.PI) / 180;
  const rx = ((Math.cos(t * Math.PI * 2) * 16) * Math.PI) / 180;

  const cosX = Math.cos(rx);
  const sinX = Math.sin(rx);
  const cosY = Math.cos(ry);
  const sinY = Math.sin(ry);
  const DISTANCE = 900;

  const project = (x, y) => {
    const z = -x * sinY;
    const Y = y * cosX - z * sinX;
    const depth = y * sinX + z * cosX;
    const scale = DISTANCE / (DISTANCE - depth);
    return [480 + x * cosY * scale, 360 + Y * scale, scale];
  };

  const panel = (x, y, w, h, extra) => {
    const points = [
      project(x, y),
      project(x + w, y),
      project(x + w, y + h),
      project(x, y + h),
    ]
      .map(([px, py]) => `${NUM(px)},${NUM(py)}`)
      .join(" ");
    return `<polygon points="${points}" ${extra}/>`;
  };

  const [tx, ty, ts] = project(-158, -46);
  const [glareX, glareY] = project(190 * Math.sin(t * Math.PI * 2), -150 * Math.cos(t * Math.PI * 2));

  return previewStage(
    `
    <defs>
      <linearGradient id="tl-band" gradientUnits="userSpaceOnUse" x1="${NUM(project(-158, 50)[0])}" y1="${NUM(project(-158, 50)[1])}" x2="${NUM(project(158, 130)[0])}" y2="${NUM(project(158, 130)[1])}">
        <stop offset="0%" stop-color="${RIND}" stop-opacity=".85"/>
        <stop offset="55%" stop-color="${FLESH}" stop-opacity=".75"/>
        <stop offset="100%" stop-color="${BLUSH}" stop-opacity=".7"/>
      </linearGradient>
      <radialGradient id="tl-glare" gradientUnits="userSpaceOnUse" cx="${NUM(glareX)}" cy="${NUM(glareY)}" r="300">
        <stop offset="0%" stop-color="#fff" stop-opacity=".26"/>
        <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <ellipse cx="480" cy="640" rx="250" ry="26" fill="#000" fill-opacity=".45"/>
    ${panel(-190, -150, 380, 300, `fill="${CARD_BG}" stroke="${CARD_LINE}" stroke-width="1.5"`)}
    ${panel(-158, -118, 66, 66, `fill="${RIND}"`)}
    ${text("Tilt card", `x="${NUM(tx)}" y="${NUM(ty)}" font-family="${FONT}" font-size="${NUM(26 * ts)}" font-weight="700" fill="${PAPER}"`)}
    ${panel(-158, -12, 250, 12, `fill="${PLATE}"`)}
    ${panel(-158, 12, 190, 12, `fill="${PLATE}"`)}
    ${panel(-158, 50, 316, 80, `fill="url(#tl-band)"`)}
    ${panel(-190, -150, 380, 300, `fill="url(#tl-glare)"`)}
  `,
    { uid: `tl${frame}` },
  );
}

/** Marquee: two rows drifting in opposite directions behind edge fades. */
function marqueePreviewFrame(frame, total) {
  const t = frame / total;
  const WORDS = ["Blink", "Pet", "Poke", "Blush"];
  const WORD_COLORS = [RIND, FLESH, PAPER, BLUSH];
  const NAMES = ["Dock", "Marquee", "Tilt card", "Number ticker", "Spotlight", "Calamansi"];

  const STEP = 260;
  const WIDTH = STEP * WORDS.length;
  const bigOffset = -t * WIDTH;
  const bigRow = Array.from({ length: WORDS.length * 2 }, (_, index) => {
    const i = index % WORDS.length;
    return text(WORDS[i], `x="${NUM(index * STEP + bigOffset)}" y="236" font-family="${FONT}" font-size="88" font-weight="700" letter-spacing="-2" fill="${WORD_COLORS[i]}"`);
  }).join("");

  const PILL_STEP = 216;
  const PILL_WIDTH = PILL_STEP * NAMES.length;
  const pillOffset = -PILL_WIDTH + t * PILL_WIDTH;
  const pillRow = Array.from({ length: NAMES.length * 2 }, (_, index) => {
    const i = index % NAMES.length;
    const x = index * PILL_STEP + pillOffset;
    return `${rect(x, 320, 186, 44, 22, `fill="${CARD_BG}" stroke="${CARD_LINE}"`)}
    ${text(NAMES[i], `x="${NUM(x + 93)}" y="348" text-anchor="middle" font-family="${FONT}" font-size="17" font-weight="600" fill="${PAPER}"`)}`;
  }).join("");

  const MONO_STEP = 300;
  const MONO_WIDTH = MONO_STEP * 6;
  const monoOffset = -t * MONO_WIDTH;
  const monoRow = Array.from({ length: 12 }, (_, index) =>
    text("NO FADE · NO PAUSE", `x="${NUM(index * MONO_STEP + monoOffset)}" y="536" font-family="${MONO}" font-size="15" font-weight="600" letter-spacing="2" fill="${PLATE_INK}"`),
  ).join("");

  return previewStage(
    `
    <defs>
      <linearGradient id="mq-fade" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#000"/>
        <stop offset="14%" stop-color="#fff"/>
        <stop offset="86%" stop-color="#fff"/>
        <stop offset="100%" stop-color="#000"/>
      </linearGradient>
      <mask id="mq-mask"><rect width="${PREVIEW_W}" height="${PREVIEW_H}" fill="url(#mq-fade)"/></mask>
    </defs>
    <g mask="url(#mq-mask)">${bigRow}${pillRow}</g>
    <g>${monoRow}</g>
  `,
    { uid: `mq${frame}` },
  );
}

/** Number ticker: an odometer rolling up to a value, then back to zero. */
function tickerPreviewFrame(frame, total) {
  const DIGITS = "12847".split("");
  const t = frame / total;
  const progress =
    t < 0.45
      ? smoothstep(t / 0.45)
      : t < 0.72
        ? 1
        : 1 - smoothstep((t - 0.72) / 0.28);

  const ROW = 150;
  const COL = 96;
  const TOP = 250;
  const stagger = 0.07;
  const span = 1 - stagger * (DIGITS.length - 1);
  const startX = PREVIEW_W / 2 - (DIGITS.length * COL) / 2;

  const columns = DIGITS.map((digit, index) => {
    const fromRight = DIGITS.length - 1 - index;
    const p = clamp01((progress - fromRight * stagger) / span);
    const value = Number(digit) * p;
    const x = startX + index * COL;

    return `
    <defs><clipPath id="tk${index}">${rect(x, TOP, COL, ROW)}</clipPath></defs>
    <g clip-path="url(#tk${index})">
      <g transform="translate(0 ${NUM(-value * ROW)})">
        ${Array.from({ length: 10 }, (_, n) =>
          glyphText(
            String(n),
            x + COL / 2,
            TOP + n * ROW + ROW * 0.74,
            132,
            PAPER,
            "middle",
          ),
        ).join("")}
      </g>
    </g>`;
  }).join("");

  return previewStage(
    `
    <defs><clipPath id="tk-window"><rect x="0" y="${TOP}" width="${PREVIEW_W}" height="${ROW}"/></clipPath></defs>
    <g clip-path="url(#tk-window)">${columns}</g>
    ${text("KALANSING", `x="480" y="470" text-anchor="middle" font-family="${MONO}" font-size="17" font-weight="700" letter-spacing="6" fill="${PLATE_INK}"`)}
    ${bar(360, 512, 240, 12, 6)}
    <circle cx="480" cy="576" r="4" fill="${RIND}"/>
    ${text("0.7s  ·  stagger 0.05", `x="480" y="618" text-anchor="middle" font-family="${MONO}" font-size="14" fill="${PLATE_INK}"`)}
  `,
    { uid: `tk${frame}` },
  );
}

/** Small stroke glyphs, drawn in a 24-unit box centred on the origin. */
function dockGlyph(kind, color, size) {
  const common = `fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"`;
  const shapes = {
    house: `<path d="M-9 1 0-8 9 1" ${common}/><path d="M-6 1v8h12V1" ${common}/>`,
    search: `<circle cx="-2" cy="-2" r="6" ${common}/><path d="M2.5 2.5 8 8" ${common}/>`,
    compass: `<circle r="9" ${common}/><path d="M-4 4 4-4M-4-4 4 4" ${common}/>`,
    layers: `<path d="M0-8 8-4 0 0-8-4z" ${common}/><path d="M-8 1 0 5 8 1" ${common}/><path d="M-8 5 0 9 8 5" ${common}/>`,
    music: `<circle cx="-3.5" cy="6" r="3.2" fill="${color}"/><path d="M-0.3 6V-8l7-1.6V4.4" ${common}/><circle cx="3.2" cy="4.4" r="3.2" fill="${color}"/>`,
    camera: `<rect x="-9" y="-5" width="18" height="13" rx="3" ${common}/><circle r="3.4" ${common}/><path d="M-3-5-1.6-8H1.6L3-5" ${common}/>`,
    bell: `<path d="M-7 5v-4a7 7 0 0 1 14 0v4" ${common}/><path d="M-9 5h18" ${common}/><circle cy="8.4" r="1.7" fill="${color}"/>`,
    gear: `<circle r="4.2" ${common}/>${Array.from(
      { length: 8 },
      (_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const x1 = Math.cos(angle) * 6.6;
        const y1 = Math.sin(angle) * 6.6;
        const x2 = Math.cos(angle) * 9;
        const y2 = Math.sin(angle) * 9;
        return `<path d="M${NUM(x1)} ${NUM(y1)} ${NUM(x2)} ${NUM(y2)}" ${common}/>`;
      },
    ).join("")}`,
  };

  return `<g transform="scale(${NUM((size * 0.42) / 12)})">${shapes[kind] ?? ""}</g>`;
}

/** Dock: icons springing up around a pointer that glides along the shelf. */
function dockPreviewFrame(frame, total) {
  const t = frame / total;
  const cursorX = lerp(150, 810, smoothstep(t < 0.5 ? t * 2 : (1 - t) * 2));
  const cursorY = 430;
  const ITEMS = ["house", "search", "compass", "layers", "music", "camera", "bell", "gear"];
  const BASE = 56;
  const MAGNIFY = 92;
  const GAP = 12;
  const REACH = 120;
  const BOTTOM = 520;

  const restingWidth = ITEMS.length * BASE + (ITEMS.length - 1) * GAP;
  const restingStart = PREVIEW_W / 2 - restingWidth / 2;

  // size each item from its resting centre, then lay the row out left to right
  const sizes = ITEMS.map((_, index) => {
    const centre = restingStart + index * (BASE + GAP) + BASE / 2;
    const lift = clamp01(1 - Math.abs(cursorX - centre) / REACH);
    return BASE + (MAGNIFY - BASE) * smoothstep(lift);
  });

  const laidOutWidth =
    sizes.reduce((sum, size) => sum + size, 0) + GAP * (ITEMS.length - 1);
  let cursor = PREVIEW_W / 2 - laidOutWidth / 2;
  const maxSize = Math.max(...sizes);

  const plates = ITEMS.map((kind, index) => {
    const size = sizes[index];
    const x = cursor;
    cursor += size + GAP;

    const lift = clamp01((size - BASE) / (MAGNIFY - BASE));
    const centreX = x + size / 2;
    const centreY = BOTTOM - size / 2;

    return `
    ${rect(x, BOTTOM - size, size, size, size * 0.32, `fill="${PLATE}"`)}
    ${rect(x, BOTTOM - size, size, size, size * 0.32, `fill="${RIND}" fill-opacity="${NUM(lift * 0.75)}"`)}
    <g transform="translate(${NUM(centreX)} ${NUM(centreY)})">
      ${dockGlyph(kind, lift > 0.45 ? INK : PLATE_INK, size)}
    </g>`;
  }).join("");

  return previewStage(
    `
    ${rect(PREVIEW_W / 2 - laidOutWidth / 2 - 14, BOTTOM - maxSize - 14, laidOutWidth + 28, maxSize + 28, 30, `fill="${CARD_BG}" stroke="${CARD_LINE}"`)}
    ${plates}
    <g transform="translate(${NUM(cursorX)} ${NUM(cursorY)})">
      <path d="M0 0v26l7-6.5 5 11 6-2.8-5-10.8 10-1z" fill="${PAPER}" stroke="${INK}" stroke-width="1.6"/>
    </g>
    ${text("glide along the dock", `x="480" y="640" text-anchor="middle" font-family="${FONT}" font-size="18" font-weight="600" fill="${PLATE_INK}"`)}
  `,
    { uid: `dk${frame}` },
  );
}

const COMPONENT_PREVIEWS = [
  { name: "spotlight-card", total: 90, render: spotlightPreviewFrame },
  { name: "tilt-card", total: 90, render: tiltPreviewFrame },
  { name: "marquee", total: 120, render: marqueePreviewFrame },
  { name: "number-ticker", total: 90, render: tickerPreviewFrame },
  { name: "dock", total: 75, render: dockPreviewFrame },
];

async function buildComponentPreviews() {
  for (const preview of COMPONENT_PREVIEWS) {
    await buildVideo({
      name: preview.name,
      total: preview.total,
      renderFrame: (frame, total) => preview.render(frame, total),
    });
  }
}

const PREVIEW_W = 960;
const PREVIEW_H = 720;

/** Shared stage: a dark card with a soft rind bloom, like the docs canvas. */
function previewStage(body, { uid = "s", background = "#14170f" } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${PREVIEW_W}" height="${PREVIEW_H}" viewBox="0 0 ${PREVIEW_W} ${PREVIEW_H}">
    <defs>
      <radialGradient id="bg-${uid}" cx="50%" cy="34%" r="66%">
        <stop offset="0%" stop-color="${RIND}" stop-opacity=".10"/>
        <stop offset="100%" stop-color="${RIND}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${PREVIEW_W}" height="${PREVIEW_H}" fill="${background}"/>
    <rect width="${PREVIEW_W}" height="${PREVIEW_H}" fill="url(#bg-${uid})"/>
    ${body}
  </svg>`;
}

/** Renders `renderFrame(frame, total)` to PNG frames and encodes them to mp4. */
async function buildVideo({ name, total, fps = 15, renderFrame }) {
  const dir = path.join(TMP, name);
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });

  for (let frame = 0; frame < total; frame += 1) {
    const svg = renderFrame(frame, total);
    await sharp(Buffer.from(svg))
      .png()
      .toFile(path.join(dir, `frame${String(frame).padStart(3, "0")}.png`));
  }

  const output = path.join(PUBLIC, `recordings/${name}-preview.mp4`);
  await run("ffmpeg", [
    "-y",
    "-framerate",
    String(fps),
    "-i",
    path.join(dir, "frame%03d.png"),
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-crf",
    "20",
    "-movflags",
    "+faststart",
    output,
  ]);
  await rm(dir, { recursive: true, force: true });
  console.log(`  ✓ public/recordings/${name}-preview.mp4`);
}

async function buildPreview() {
  const TOTAL = 90;

  await buildVideo({
    name: "calamansi",
    total: TOTAL,
    renderFrame: (frame) =>
      previewStage(
        `<svg x="260" y="110" width="440" height="500" viewBox="${ART_VIEWBOX}" preserveAspectRatio="xMidYMid meet">${mascotArt({ ...previewFrameState(frame, TOTAL), uid: `p${frame}` })}</svg>`,
        { uid: "p" },
      ),
  });
}

/* ── main ────────────────────────────────────────────────────────────────── */

console.log("Generating Calamansi assets…");

await mkdir(path.join(PUBLIC, "brand"), { recursive: true });
await mkdir(path.join(PUBLIC, "logos"), { recursive: true });

await render(ogSvg(), "opengraph-image.png");
await render(twitterSvg(), "twitter-image.png");

await render(appIconSvg(512), "icon-512.png");
await render(appIconSvg(192), "icon-192.png");
await render(appIconSvg(512, 0.42), "icon-512-maskable.png");
await render(appIconSvg(180), "apple-touch-icon.png");
await render(appIconSvg(150), "mstile-150x150.png");
await render(appIconSvg(512), "brand/calamansi-logo.png");

// favicon.ico — modern PNG-in-ICO container with transparent background (mascot only)
const icoSizes = [16, 32, 48];
const icoPngs = [];
for (const size of icoSizes) {
  const icoSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${ART_VIEWBOX}">${mascotArt({ uid: `ico${size}` })}</svg>`;
  icoPngs.push({
    size,
    buf: await sharp(Buffer.from(icoSvg)).png().toBuffer(),
  });
}
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(icoPngs.length, 4);
const entries = Buffer.alloc(16 * icoPngs.length);
let offset = 6 + 16 * icoPngs.length;
icoPngs.forEach((entry, index) => {
  const base = index * 16;
  entries.writeUInt8(entry.size >= 256 ? 0 : entry.size, base);
  entries.writeUInt8(entry.size >= 256 ? 0 : entry.size, base + 1);
  entries.writeUInt16LE(1, base + 4);
  entries.writeUInt16LE(32, base + 6);
  entries.writeUInt32LE(entry.buf.length, base + 8);
  entries.writeUInt32LE(offset, base + 12);
  offset += entry.buf.length;
});
const icoBuffer = Buffer.concat([header, entries, ...icoPngs.map((entry) => entry.buf)]);
await writeFile(path.join(PUBLIC, "favicon.ico"), icoBuffer);
await writeFile(path.join(ROOT, "app/favicon.ico"), icoBuffer);
console.log("  ✓ public/favicon.ico (transparent mascot)");
console.log("  ✓ app/favicon.ico (transparent mascot)");

// static SVG sources
const fullColorMark = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="${ART_VIEWBOX}">${mascotArt({ uid: "favicon" })}</svg>`;
await writeFile(path.join(PUBLIC, "favicon.svg"), fullColorMark);
console.log("  ✓ public/favicon.svg");

// monochrome mark for the gallery card, which recolours it with a CSS filter
const monoMark = `<svg xmlns="http://www.w3.org/2000/svg" width="612" height="612" viewBox="${ART_VIEWBOX}">
  <defs>
    <mask id="mono-eyes" maskUnits="userSpaceOnUse" x="-200" y="-200" width="1200" height="1200">
      <rect x="-200" y="-200" width="1200" height="1200" fill="#fff"/>
      <rect x="${EYE.left}" y="${EYE.y}" width="${EYE.w}" height="${EYE.h}" rx="${EYE.rx}" fill="#000"/>
      <rect x="${EYE.right}" y="${EYE.y}" width="${EYE.w}" height="${EYE.h}" rx="${EYE.rx}" fill="#000"/>
    </mask>
  </defs>
  <g mask="url(#mono-eyes)" fill="#000">
    <path d="${STEM}" stroke="#000" stroke-width="6" stroke-linejoin="round"/>
    <path d="${LEAF_PATH}" stroke="#000" stroke-width="6" stroke-linejoin="round"/>
    <path d="${BODY}"/>
  </g>
</svg>`;
await writeFile(path.join(PUBLIC, "logos/calamansi.svg"), monoMark);
console.log("  ✓ public/logos/calamansi.svg");

await buildPreview();
await buildComponentPreviews();

await rm(TMP, { recursive: true, force: true });

console.log("Done.");
