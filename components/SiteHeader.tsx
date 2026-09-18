import Link from "next/link";
import { CalamansiMark } from "@/components/ui/calamansi";
import MascotPokeCounter from "@/components/MascotPokeCounter";
import SiteNav from "@/components/SiteNav";

/**
 * The site header, in the same language as the footer: one hairline rule, the
 * same 96rem gutter as every section below it, a large wordmark and plain links.
 * No pills, no capsule — the type and the rules are doing the work.
 */
export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[96rem] items-center gap-5 px-6 sm:h-20 sm:gap-10 sm:px-10">
        <Link
          href="/"
          aria-label="Calamansi UI home"
          className="flex shrink-0 items-center gap-2.5"
        >
          <CalamansiMark className="size-7 text-primary sm:size-8" />
          <span className="font-runde hidden text-xl font-bold tracking-tight whitespace-nowrap min-[420px]:inline sm:text-2xl">
            Calamansi UI
          </span>
        </Link>

        <SiteNav className="ml-auto" />

        {/* the running total of pokes landed on the hero mascot */}
        <MascotPokeCounter />
      </div>
    </header>
  );
}
