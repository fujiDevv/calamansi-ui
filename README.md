# Calamansi UI

Components with a little sour. A shadcn registry and demo site for the Calamansi UI citrus kit — a tiny Filipino fruit that blinks, follows the cursor, blushes when you pet it, and goes tart if you poke it too much.

## Development

```bash
npm install
npm run dev
```

## Registry

Components live in `components/ui`. Adding one takes four steps:

1. Write the component in `components/ui/<name>.tsx`.
2. Add it to `registry.json`.
3. Add an entry to `components` in `lib/components.ts` (name, description, props, usage, preview) — this drives the gallery, sidebar, sitemap, `llms.txt` and the docs panel.
4. Add a docs route at `app/components/(docs)/<name>/` with a `page.tsx` and the `demo.tsx` shown on the canvas.

Then rebuild the static registry payloads, which the docs drawer and the CLI both read:

```bash
npm run registry:build
```

The generated files are written to `public/r`.

## Branding

All identity lives in `lib/site.ts` — name, domain, repository, author and social
links. Change it there and the metadata, Open Graph tags, JSON-LD, sitemap,
robots.txt, `llms.txt`, footer and install commands all follow.

The palette is in `app/globals.css` under the `calamansi-*` tokens (rind, flesh,
leaf, blush, pith).

## Artwork

The mascot and logo share the art in `components/ui/calamansi.tsx`. Everything
raster — Open Graph, Twitter, favicons, PWA icons, and one preview video per
component for the gallery — is generated from SVG sources:

```bash
npm run assets:build
```

The script reads the mascot geometry out of the component and the repository
slug out of `lib/site.ts`, so neither can drift. The generated files are
committed; re-run the script only when the artwork or brand changes.
