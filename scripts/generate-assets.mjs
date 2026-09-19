/**
 * Generates every brand asset: the marks and the two share cards.
 *
 *   node scripts/generate-assets.mjs               # everything
 *   node scripts/generate-assets.mjs cards         # the two share cards only
 *   node scripts/generate-assets.mjs marks         # icons, favicon, marks
 *
 * The mascot geometry is read straight out of `components/ui/calamansi.tsx`, so
 * the artwork can never drift from the component, and every mark is boxed on the
 * artwork's measured ink rather than the file's transparent margins.
 *
 * Two renderers, because the assets are two different things. Pure geometry goes
 * through `sharp` (already a transitive dependency of Next.js). The share cards
 * carry type, and the type has to be OpenRunde — which the repo only has as
 * .woff2, a format FreeType cannot read — so they are laid out as HTML and
 * photographed with headless Chrome. Set `CHROME_PATH` if Chrome is not somewhere
 * usual.
 *
 * The output is committed, so this only has to run when the brand art changes.
 */
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import path from "node:path";
import sharp from "sharp";

const run = promisify(execFile);

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = path.join(ROOT, "public");
const SCRATCH = path.join(ROOT, ".asset-build");

/* ── brand constants ──────────────────────────────────────────────────────── */

const RIND = "#b4e84c";
const RIND_DEEP = "#86b81f";
const LEAF = "#4e9a3e";
const BLUSH = "#ff7e9d";
const INK = "#0b0d08";
const PAPER = "#f2f6e8";
const MUTED = "#98a389";
const DESTRUCTIVE = "#f04438";

/* ── identity, pulled from lib/site.ts ───────────────────────────────────── */

const siteSource = await readFile(path.join(ROOT, "lib/site.ts"), "utf8");
const REPO_SLUG = siteSource.match(
  /SITE_REPO = "https:\/\/github\.com\/([^"]+)"/,
)?.[1];
const SITE_NAME = siteSource.match(/SITE_NAME = "([^"]+)"/)?.[1];
const SITE_DOMAIN = siteSource.match(/SITE_DOMAIN = "([^"]+)"/)?.[1];

if (!REPO_SLUG) throw new Error("Could not find SITE_REPO in lib/site.ts");
if (!SITE_NAME || !SITE_DOMAIN) {
  throw new Error("Could not find SITE_NAME / SITE_DOMAIN in lib/site.ts");
}

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
 * component does with GSAP, so the snapshot stands in for the thing itself.
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

async function render(svg, file, size) {
  const image = sharp(Buffer.from(svg));
  const pipeline = size ? image.resize(size) : image;
  await pipeline.png({ compressionLevel: 9 }).toFile(path.join(PUBLIC, file));
  console.log(`  ✓ public/${file}`);
}

/* ── the artwork's ink box ───────────────────────────────────────────────── */

/**
 * The box the artwork actually paints in, in `ART_VIEWBOX` units.
 *
 * The paths carry a lot of air, and it is not even air: the fruit sits 21 units
 * right of the file's centre and 5 low. Anything that centres the *file* centres
 * that air instead, and the mark reads off-centre — most visibly in the app icon,
 * where 21 units is 4% of the plate. Measuring the painted pixels once gives every
 * mark below the same true box to centre on, and it is read from the art itself, so
 * it follows the artwork rather than a number kept in step by hand.
 */
async function measureInkBox(art) {
  const [boxX, boxY, boxW, boxH] = ART_VIEWBOX.split(" ").map(Number);
  const probe = `<svg xmlns="http://www.w3.org/2000/svg" width="${boxW}" height="${boxH}" viewBox="${ART_VIEWBOX}">${art}</svg>`;
  const { data, info } = await sharp(Buffer.from(probe))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let left = info.width;
  let top = info.height;
  let right = -1;
  let bottom = -1;

  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      // the raster is 1:1 with the viewBox, so one pixel is one user unit
      if (data[(y * info.width + x) * info.channels + 3] < 12) continue;
      if (x < left) left = x;
      if (x > right) right = x;
      if (y < top) top = y;
      if (y > bottom) bottom = y;
    }
  }

  // a hair of slack either way: the leaf's round join lands just outside the sample
  const slack = 2;
  return {
    x: boxX + left - slack,
    y: boxY + top - slack,
    width: right - left + 1 + slack * 2,
    height: bottom - top + 1 + slack * 2,
  };
}

const ART_BOX = await measureInkBox(mascotArt({ uid: "ink" }));
const ART_ASPECT = ART_BOX.width / ART_BOX.height;
/** The artwork's own box, as a viewBox — what every mark below is framed by. */
const MARK_VIEWBOX = `${ART_BOX.x} ${ART_BOX.y} ${ART_BOX.width} ${ART_BOX.height}`;

console.log(
  `  · artwork ink ${ART_BOX.width}×${ART_BOX.height} at ${ART_BOX.x},${ART_BOX.y} — framed by it, not the file's ${ART_VIEWBOX.split(" ")[2]}×${ART_VIEWBOX.split(" ")[3]} margins`,
);

/**
 * The mascot as a standalone mark, drawn at the aspect it actually has — so a
 * caller places it by width and the art decides the height.
 */
const markSvg = (uid, width) => {
  const height = Math.round(width / ART_ASPECT);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${MARK_VIEWBOX}">${mascotArt({ uid })}</svg>`;
};

/**
 * App icon: a flat ink plate with the fruit centred on its ink box.
 *
 * The plate is rounded where the icon is shown as a tile — a browser tab, a
 * bookmark, schema.org's `logo` — and square where something else does the
 * masking: Android crops maskable icons itself and iOS rounds `apple-touch-icon`
 * itself, and a second rounding inside the first is what makes an icon read as a
 * sticker. `markWidth` is the art's share of the plate: 0.68 fills it the way a
 * glyph fills an icon, and the smaller maskable share is what keeps the fruit
 * inside the 80% circle Android guarantees to show.
 */
function appIconSvg(size, { markWidth = 0.68, radius = 0.22 } = {}) {
  const mark = Math.round(size * markWidth);
  const markHeight = Math.round(mark / ART_ASPECT);
  const x = Math.round((size - mark) / 2);
  const y = Math.round((size - markHeight) / 2);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${Math.round(size * radius)}" fill="${INK}"/>
  <svg x="${x}" y="${y}" width="${mark}" height="${markHeight}" viewBox="${MARK_VIEWBOX}">${mascotArt({ uid: `icon${size}` })}</svg>
</svg>`;
}

/* ── headless Chrome ─────────────────────────────────────────────────────── */

const CHROME_PATHS = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
];

function findChrome() {
  const onPath = (name) =>
    (process.env.PATH ?? "")
      .split(path.delimiter)
      .map((dir) => path.join(dir, name))
      .find((candidate) => existsSync(candidate));

  const found = [
    process.env.CHROME_PATH,
    ...CHROME_PATHS,
    onPath("google-chrome"),
    onPath("chromium"),
  ].find((candidate) => candidate && existsSync(candidate));

  if (!found) {
    throw new Error(
      "Headless Chrome not found. Set CHROME_PATH, or install Chrome — the share cards are photographed through it.",
    );
  }
  return found;
}

/** Lays `html` out in Chrome and photographs the viewport, pixel for pixel. */
async function renderHtml(html, file, { width, height, scale = 1 }) {
  const dir = path.join(SCRATCH, "cards");
  const stem = path.basename(file, ".png");
  const page = path.join(dir, `${stem}.html`);
  const shot = path.join(dir, `${stem}-raw.png`);
  await mkdir(dir, { recursive: true });
  await writeFile(page, html);

  await run(findChrome(), [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--hide-scrollbars",
    "--force-color-profile=srgb",
    `--force-device-scale-factor=${scale}`,
    `--window-size=${width},${height}`,
    // lets the webfont land before the shutter, without a timer of our own
    "--virtual-time-budget=3000",
    `--screenshot=${shot}`,
    `file://${page}`,
  ]);

  const image = sharp(shot);
  const meta = await image.metadata();
  if (meta.width !== width * scale || meta.height !== height * scale) {
    throw new Error(
      `${file} came back ${meta.width}×${meta.height}, expected ${width * scale}×${height * scale}`,
    );
  }

  await image
    .png({ compressionLevel: 9, effort: 10 })
    .toFile(path.join(PUBLIC, file));
  console.log(`  ✓ public/${file} (${meta.width}×${meta.height})`);
}

/* ── share cards ─────────────────────────────────────────────────────────── */

const CARD_SIZE = { width: 1200, height: 630 };

/**
 * The copy the cards carry. The voice line is the footer's, the fact line and the
 * domain say what the site is and where it lives — read from `lib/site.ts` so the
 * card cannot end up naming a domain the site does not canonicalise to.
 */
const CARD_COPY = {
  voice: "Components with a little sour.",
  fact: "A citrus UI kit for React and Next.js.",
};

/**
 * The brand font, inlined. The card is one self-contained page, so the weights ride
 * along as data URIs: nothing to fetch, and nothing to race the screenshot.
 */
async function fontFaceCss() {
  const weights = [
    ["OpenRunde-Regular.woff2", 400],
    ["OpenRunde-Medium.woff2", 500],
    ["OpenRunde-Bold.woff2", 700],
  ];
  const faces = await Promise.all(
    weights.map(async ([file, weight]) => {
      const font = await readFile(path.join(ROOT, "assets/fonts", file));
      return `@font-face{font-family:OpenRunde;font-style:normal;font-weight:${weight};font-display:block;src:url(data:font/woff2;base64,${font.toString("base64")}) format("woff2")}`;
    }),
  );
  return faces.join("\n");
}

/**
 * The card shell. Plain on purpose: one flat ink field, and the only thing on it
 * besides the type is a single soft light behind the fruit. No grid, no rings, no
 * second accent — the fruit is the accent.
 */
async function cardPage(styles, body) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>${SITE_NAME}</title><style>
${await fontFaceCss()}
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:${CARD_SIZE.width}px;height:${CARD_SIZE.height}px}
  body{background:${INK};color:${PAPER};font-family:OpenRunde,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
  .card{position:relative;width:${CARD_SIZE.width}px;height:${CARD_SIZE.height}px;overflow:hidden}
  .bloom{position:absolute;border-radius:50%;background:radial-gradient(circle,rgba(180,232,76,.13) 0%,rgba(180,232,76,.045) 42%,rgba(180,232,76,0) 70%)}
${styles}
</style></head>
<body><div class="card">
${body}
</div></body></html>`;
}

/**
 * Open Graph card: the wordmark, one line of voice, one of fact, the fruit.
 *
 * Everything hangs off the same 88px margin, and the mark is placed by the height
 * its own ink box wants rather than a width it was told — so the fruit and the
 * type sit on one optical line instead of two nearly-identical ones.
 */
async function buildOgCard() {
  const margin = 88;
  const markWidth = 356;
  const markHeight = Math.round(markWidth / ART_ASPECT);
  const markLeft = CARD_SIZE.width - margin - markWidth;
  const markTop = Math.round((CARD_SIZE.height - markHeight) / 2);

  const html = await cardPage(
    `  .mark{position:absolute;left:${markLeft}px;top:${markTop}px}
  .bloom{left:${markLeft + markWidth / 2 - 450}px;top:${markTop + markHeight / 2 - 450}px;width:900px;height:900px}
  .wordmark{position:absolute;left:${margin}px;top:224px;font-size:84px;font-weight:700;letter-spacing:-0.03em;line-height:1;color:${PAPER}}
  .voice{position:absolute;left:${margin}px;top:330px;font-size:30px;font-weight:500;line-height:1;color:${RIND}}
  .fact{position:absolute;left:${margin}px;top:380px;font-size:21px;font-weight:400;line-height:1;color:${MUTED}}
  .domain{position:absolute;left:${margin}px;top:540px;font-size:17px;font-weight:500;letter-spacing:0.04em;line-height:1;color:${MUTED}}`,
    `  <div class="bloom"></div>
  <div class="mark">${markSvg("og", markWidth)}</div>
  <h1 class="wordmark">${SITE_NAME}</h1>
  <p class="voice">${CARD_COPY.voice}</p>
  <p class="fact">${CARD_COPY.fact}</p>
  <p class="domain">${SITE_DOMAIN}</p>`,
  );

  await renderHtml(html, "opengraph-image.png", CARD_SIZE);
}

/**
 * Twitter card: the same parts on the centre line, and the fact line dropped — a
 * summary card is cropped toward a square in some placements, so the fruit and the
 * two lines that name the thing are the ones worth keeping.
 */
async function buildTwitterCard() {
  const markWidth = 208;
  const markHeight = Math.round(markWidth / ART_ASPECT);
  const markTop = 66;

  const html = await cardPage(
    `  .mark{position:absolute;left:${(CARD_SIZE.width - markWidth) / 2}px;top:${markTop}px}
  .bloom{left:${CARD_SIZE.width / 2 - 420}px;top:${markTop + markHeight / 2 - 420}px;width:840px;height:840px}
  .centre{position:absolute;left:0;width:${CARD_SIZE.width}px;text-align:center}
  .wordmark{top:356px;font-size:64px;font-weight:700;letter-spacing:-0.03em;line-height:1;color:${PAPER}}
  .voice{top:434px;font-size:26px;font-weight:500;line-height:1;color:${RIND}}
  .domain{top:552px;font-size:16px;font-weight:500;letter-spacing:0.04em;line-height:1;color:${MUTED}}`,
    `  <div class="bloom"></div>
  <div class="mark">${markSvg("tw", markWidth)}</div>
  <h1 class="wordmark centre">${SITE_NAME}</h1>
  <p class="voice centre">${CARD_COPY.voice}</p>
  <p class="domain centre">${SITE_DOMAIN}</p>`,
  );

  await renderHtml(html, "twitter-image.png", CARD_SIZE);
}


/* ── the animated mark ───────────────────────────────────────────────────── */

/**
 * The mark the README wears, with the mascot's own motion: a float, a leaf sway
 * and a blink.
 *
 * Plain, and deliberately so. It is the same fruit the kit draws everywhere else —
 * flat rind, leaf and ink eyes — rather than the grain, sheen, bevel, veins and
 * drop shadow it used to carry, which made the logo a different object from the
 * mascot it names. Every path comes from the component, so the two cannot drift.
 *
 * `transform-box: fill-box` gives each part an origin in its own box: the sway
 * hinges on the leaf's base and the blink on the eyes' centre without a single
 * hand-counted coordinate. The whole thing holds still for anyone who has asked for
 * less motion.
 */
function animatedMarkSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${MARK_VIEWBOX}" width="${ART_BOX.width}" height="${ART_BOX.height}" role="img" aria-label="${SITE_NAME}">
  <defs>
    <clipPath id="mascot-body"><path d="${BODY}"/></clipPath>
    <radialGradient id="mascot-glare" cx="36%" cy="20%" r="78%">
      <stop offset="0%" stop-color="#fff" stop-opacity=".32"/>
      <stop offset="36%" stop-color="#fff" stop-opacity=".12"/>
      <stop offset="72%" stop-color="#fff" stop-opacity=".02"/>
      <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="mascot-rim" cx="50%" cy="50%" r="50%">
      <stop offset="72%" stop-color="#fff" stop-opacity="0"/>
      <stop offset="92%" stop-color="#fff" stop-opacity=".16"/>
      <stop offset="100%" stop-color="#fff" stop-opacity=".26"/>
    </radialGradient>
  </defs>
  <style>
    .float { animation: float 4.6s ease-in-out infinite; transform-box: fill-box; transform-origin: center }
    .sway { animation: sway 4.6s ease-in-out infinite; transform-box: fill-box; transform-origin: 6% 94% }
    .blink { animation: blink 5.2s ease-in-out infinite; transform-box: fill-box; transform-origin: center }
    @keyframes float { 0%, 100% { transform: translateY(0) rotate(0deg) } 50% { transform: translateY(-8px) rotate(1deg) } }
    @keyframes sway { 0%, 100% { transform: rotate(0deg) } 50% { transform: rotate(4deg) } }
    @keyframes blink { 0%, 44%, 50%, 100% { transform: scaleY(1) } 47% { transform: scaleY(0.08) } }
    @media (prefers-reduced-motion: reduce) { .float, .sway, .blink { animation: none } }
  </style>
  <g class="float">
    <path d="${STEM}" fill="${LEAF}" stroke="${LEAF}" stroke-width="6" stroke-linejoin="round"/>
    <path class="sway" d="${LEAF_PATH}" fill="${LEAF}" stroke="${LEAF}" stroke-width="6" stroke-linejoin="round"/>
    <path class="sway" d="${LEAF_PATH}" fill="none" opacity=".45" stroke="${RIND_DEEP}" stroke-width="5" stroke-linecap="round"/>
    <path d="${BODY}" fill="${RIND}"/>
    <g clip-path="url(#mascot-body)">
      <ellipse cx="244" cy="196" rx="232" ry="188" fill="url(#mascot-glare)"/>
      <ellipse cx="306" cy="320" rx="306" ry="252" fill="url(#mascot-rim)" opacity=".6"/>
    </g>
    <g class="blink" fill="${INK}">
      <rect x="${EYE.left}" y="${EYE.y}" width="${EYE.w}" height="${EYE.h}" rx="${EYE.rx}"/>
      <rect x="${EYE.right}" y="${EYE.y}" width="${EYE.w}" height="${EYE.h}" rx="${EYE.rx}"/>
    </g>
  </g>
</svg>`;
}

/* ── main ────────────────────────────────────────────────────────────────── */

const TARGETS = ["all", "cards", "marks"];
const target = process.argv[2] ?? "all";

if (!TARGETS.includes(target)) {
  throw new Error(
    `Unknown target "${target}". One of: ${TARGETS.join(", ")}`,
  );
}

const wants = (name) => target === "all" || target === name;

console.log(`Generating Calamansi assets (${target})…`);

await mkdir(path.join(PUBLIC, "brand"), { recursive: true });
await mkdir(path.join(PUBLIC, "logos"), { recursive: true });

if (wants("cards")) {
  await buildOgCard();
  await buildTwitterCard();
}

if (wants("marks")) {
  // rounded plate: the icon is shown as a tile — a tab, a bookmark, schema logo
  await render(appIconSvg(512), "icon-512.png");
  await render(appIconSvg(192), "icon-192.png");
  await render(appIconSvg(512), "brand/calamansi-logo.png");

  // square plate: something else does the masking, and a rounded square inside a
  // rounded mask is what makes an icon read as a sticker
  await render(appIconSvg(512, { markWidth: 0.5, radius: 0 }), "icon-512-maskable.png");
  await render(appIconSvg(180, { markWidth: 0.62, radius: 0 }), "apple-touch-icon.png");
  await render(appIconSvg(150, { markWidth: 0.62, radius: 0 }), "mstile-150x150.png");
}

if (wants("marks")) {
  // favicon.ico — modern PNG-in-ICO container with transparent background (mascot only)
  const icoSizes = [16, 32, 48];
  const icoPngs = [];
  for (const size of icoSizes) {
    const icoSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${MARK_VIEWBOX}">${mascotArt({ uid: `ico${size}` })}</svg>`;
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
  const icoBuffer = Buffer.concat([
    header,
    entries,
    ...icoPngs.map((entry) => entry.buf),
  ]);
  await writeFile(path.join(PUBLIC, "favicon.ico"), icoBuffer);
  await writeFile(path.join(ROOT, "app/favicon.ico"), icoBuffer);
  console.log("  ✓ public/favicon.ico (transparent mascot)");
  console.log("  ✓ app/favicon.ico (transparent mascot)");

  // static SVG sources, all framed by the artwork's own box
  const fullColorMark = `<svg xmlns="http://www.w3.org/2000/svg" width="${ART_BOX.width}" height="${ART_BOX.height}" viewBox="${MARK_VIEWBOX}">${mascotArt({ uid: "favicon" })}</svg>`;
  await writeFile(path.join(PUBLIC, "favicon.svg"), fullColorMark);
  /* the same mark Next serves from the app directory — one source, two routes */
  await writeFile(path.join(ROOT, "app/icon.svg"), fullColorMark);
  console.log("  ✓ public/favicon.svg + app/icon.svg");

  // monochrome mark for the gallery card, which recolours it with a CSS filter
  const monoMark = `<svg xmlns="http://www.w3.org/2000/svg" width="${ART_BOX.width}" height="${ART_BOX.height}" viewBox="${MARK_VIEWBOX}">
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

  await writeFile(
    path.join(PUBLIC, "brand/calamansi-animated.svg"),
    animatedMarkSvg(),
  );
  console.log("  ✓ public/brand/calamansi-animated.svg");
}

await rm(SCRATCH, { recursive: true, force: true });

console.log("Done.");
