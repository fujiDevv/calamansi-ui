import NotFoundBody from "@/components/NotFoundBody";

/**
 * A page in this group threw `notFound()` — the component index is a stub today.
 * The `(site)` layout is already around this render and brings the header and the
 * footer, so the boundary contributes the message and nothing more.
 *
 * No `metadata` here: Next only applies a boundary's metadata to the standalone
 * `404.html`, not to a page that throws. The automatic `noindex` covers these.
 */

export default function SiteNotFound() {
  return <NotFoundBody />;
}
