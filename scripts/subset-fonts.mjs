/**
 * Subsets the OpenRunde faces in `assets/fonts` into `app/fonts`.
 *
 *   node scripts/subset-fonts.mjs
 *
 * Why this exists: `next/font/local` does not subset. It hands the browser
 * whatever file it is given, and the full OpenRunde faces are ~160 KB each
 * because they carry every script the foundry ships — glyphs this site never
 * renders, since every page is Latin. All four weights are preloaded by the
 * layout, so the full faces were costing roughly 620 KB of the first paint.
 *
 * The range kept here is the `latin` range Google Fonts serves, which is what
 * the Inter and Geist Mono faces on the page are already cut to (they come
 * through `next/font/google` with `subsets: ["latin"]`). Matching it means
 * OpenRunde stops being the one face on the page with a wider character set
 * than the text around it needs.
 *
 * `assets/fonts` is the source of truth and keeps the originals untouched; the
 * files written to `app/fonts` are committed, the same way the generated brand
 * art is. Re-run this if a face is ever replaced.
 */
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import subsetFont from "subset-font";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = path.join(ROOT, "assets", "fonts");
const OUTPUT = path.join(ROOT, "app", "fonts");

/**
 * Google Fonts' `latin` unicode-range, expanded into the string of characters a
 * subset keeps. Written as ranges rather than a literal so it reads as the same
 * definition Google publishes.
 */
const LATIN_RANGES = [
  [0x0000, 0x00ff], // Basic Latin + Latin-1 Supplement
  [0x0131, 0x0131], // ı
  [0x0152, 0x0153], // Œ œ
  [0x02bb, 0x02bc], // ʻ ʼ
  [0x02c6, 0x02c6], // ˆ
  [0x02da, 0x02da], // ˚
  [0x02dc, 0x02dc], // ˜
  [0x0304, 0x0304], // combining macron
  [0x0308, 0x0308], // combining diaeresis
  [0x0329, 0x0329], // combining vertical line below
  [0x2000, 0x206f], // General Punctuation — dashes, quotes, ellipsis
  [0x20ac, 0x20ac], // €
  [0x2122, 0x2122], // ™
  [0x2190, 0x2190], // ←  — the published range carries ↑ and ↓ but not ← or →,
  [0x2191, 0x2191], // ↑     and the docs' back links are set with ←
  [0x2192, 0x2192], // →
  [0x2193, 0x2193], // ↓
  [0x2212, 0x2212], // −
  [0x2215, 0x2215], // ∕
  [0xfeff, 0xfeff], // ZWNBSP
  [0xfffd, 0xfffd], // replacement character
];

const CHARSET = LATIN_RANGES.flatMap(([from, to]) =>
  Array.from({ length: to - from + 1 }, (_, offset) =>
    String.fromCodePoint(from + offset),
  ),
).join("");

const kb = (bytes) => `${(bytes / 1024).toFixed(0)} KB`;

const files = (await readdir(SOURCE).catch(() => []))
  .filter((name) => name.endsWith(".woff2"))
  .sort();

if (files.length === 0) {
  throw new Error(`No .woff2 files to subset in ${SOURCE}`);
}

await mkdir(OUTPUT, { recursive: true });

console.log("Subsetting OpenRunde…");

let before = 0;
let after = 0;

for (const name of files) {
  const input = await readFile(path.join(SOURCE, name));
  const output = await subsetFont(input, CHARSET, { targetFormat: "woff2" });

  await writeFile(path.join(OUTPUT, name), output);

  before += input.length;
  after += output.length;

  const saved = 100 - (output.length / input.length) * 100;
  console.log(
    `  ✓ app/fonts/${name}  ${kb(input.length)} → ${kb(output.length)}  (-${saved.toFixed(0)}%)`,
  );
}

console.log(
  `Done. ${kb(before)} → ${kb(after)} across ${files.length} faces (-${(
    100 -
    (after / before) * 100
  ).toFixed(0)}%).`,
);
