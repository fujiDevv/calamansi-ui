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
    */
    <div className="flex min-h-screen flex-col overflow-x-clip">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
