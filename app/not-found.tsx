import type { Metadata } from "next";
import NotFoundBody from "@/components/NotFoundBody";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * THE 404 THE HOST SERVES
 *
 * The site is a static export, so this is the single page every address that isn't
 * here gets — `/nope`, a mistyped slug, a link to a component that was renamed.
 *
 * It carries the header and footer itself, because `not-found.tsx` here is picked
 * up from the root: the only layout above it is `app/layout.tsx`, never the
 * `(site)` group's, however much this page looks like it belongs there. The wrapper
 * below is that layout's, with its two load-bearing classes intact —
 * `overflow-x-clip`, since `hidden` would make this a scroll container and unstick
 * the header, and the bottom padding that keeps the floating nav clear of the
 * footer's last row.
 *
 * The boundaries that catch an in-app `notFound()` are elsewhere, and deliberately
 * bare — see `components/NotFoundBody` for why.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const metadata: Metadata = {
  title: "Page not found",
  /* nothing here is worth a search result: it is the same page at every address */
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip pb-12 sm:pb-14">
      <SiteHeader />
      <main className="flex-1">
        <NotFoundBody />
      </main>
      <SiteFooter />
    </div>
  );
}
