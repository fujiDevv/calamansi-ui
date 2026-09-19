import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    /*
      overflow-x-clip, not overflow-x-hidden: hidden forces overflow-y to auto, which
      turns this wrapper into a scroll container and stops the header sticking to the
      viewport. clip trims the same horizontal overflow without that side effect.

      pb-* is the nav's band, the same way the nav reserves its own height at the
      top: the handle floats over the page's bottom-centre, so without it the last
      row of the footer sits underneath it (at 375 it was covering the llms.txt
      link). It is sized to the handle's own box at both of its offsets — 44px of
      pill sitting 20px off the bottom edge, and 32px at sm — so the last row clears
      it at either position.
    */
    <div className="flex min-h-screen flex-col overflow-x-clip pb-16 sm:pb-20">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
