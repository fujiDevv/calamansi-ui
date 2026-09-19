import SiteNav from "@/components/SiteNav";

/**
 * The marketing header is the floating nav and nothing else: the pills carry the
 * bar, the wordmark and the switches, so all this adds is the banner landmark
 * around them. `SiteNav` also holds the space the bar hovers over, which is what
 * keeps the page's first section clear of it.
 */
export default function SiteHeader() {
  return (
    <header>
      <SiteNav />
    </header>
  );
}
