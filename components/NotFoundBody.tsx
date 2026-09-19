import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Calamansi } from "@/components/ui/calamansi";
import { cn } from "@/lib/utils";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * THE DEAD END
 *
 * The message this site's 404 says, and nothing else — no header, no footer, no
 * padding that assumes a page. That is deliberate: it is served from two different
 * places, and only one of them owns the chrome.
 *
 *  - `app/not-found.tsx` is the standalone one — the static `404.html` the host
 *    hands out for every address that isn't here. Nothing wraps it but the root
 *    layout, so that file brings the header and the footer itself.
 *  - `app/(site)/not-found.tsx` catches the `notFound()` a page in that group can
 *    throw, which today is the component index. That render is already inside the
 *    group's layout — the marketing shell, header and footer both — so the boundary
 *    adds nothing but this message. Without it the root boundary would be reached
 *    through that same layout and paint a second nav and a second footer.
 *
 * The docs rail keeps a boundary of its own, and should: a component page that is
 * not written yet is a different thing from a wrong address, and it names the
 * component it is waiting on rather than shrugging at the reader.
 *
 * A wrong URL is nearly always a reader arriving from outside, so the page offers
 * the way back in and the two things worth doing next, and stops there.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** The marketing shell's gutter and micro-label, the pair the home page runs on. */
const SHELL = "mx-auto w-full max-w-[96rem] px-6 sm:px-10";
const EYEBROW =
  "text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase";

export default function NotFoundBody() {
  return (
    <div className={cn(SHELL, "py-16 sm:py-24")}>
      <p className={EYEBROW}>Error 404</p>

      <h1 className="mt-5 font-runde text-[clamp(2.5rem,11.5vw,9.5rem)] leading-[0.92] font-bold tracking-tight sm:mt-8">
        This page <span className="text-muted-foreground">went sour.</span>
      </h1>

      <div className="mt-8 grid gap-10 border-t border-border pt-8 sm:mt-14 sm:pt-12 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-5">
          <p className="max-w-md text-base leading-relaxed text-muted-foreground">
            Nothing lives at this address. It may have moved, it may never have
            been here — but the registry is exactly where you left it.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-2.5">
            <Button href="/" variant="primary" size="md">
              <ArrowLeft className="size-4" />
              Back home
            </Button>
            <Button href="/components/calamansi" variant="outline" size="md">
              Explore components
              <ArrowUpRight className="size-4" />
            </Button>
          </div>
        </div>

        {/*
          A tart one, for obvious reasons, and in the brand's lime rather than the
          component's default `currentColor` — this is the one page where the fruit
          is carrying the identity on its own. Not interactive on purpose: a dead
          end is no place to ask a reader to play.
        */}
        <div className="flex items-center justify-center lg:col-span-7 lg:justify-end">
          <Calamansi
            variant="primary"
            mood="tart"
            interactive={false}
            size={160}
          />
        </div>
      </div>
    </div>
  );
}
