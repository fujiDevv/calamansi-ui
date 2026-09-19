"use client";

import SiteNav from "@/components/SiteNav";

/**
 * The docs header is the same floating nav as the marketing pages — one bar, one
 * place to change it. Passing the drawer through is the only difference, and it
 * is what puts the toggle in the bar (`md:hidden`, because the rail takes over
 * from md up).
 */
export default function DocsHeader({
  mobileOpen,
  setMobileOpen,
}: {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}) {
  return (
    <header>
      <SiteNav menuOpen={mobileOpen} onMenuToggle={setMobileOpen} />
    </header>
  );
}
