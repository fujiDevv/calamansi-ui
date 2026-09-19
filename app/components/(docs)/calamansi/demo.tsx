import { Calamansi } from "@/components/ui/calamansi";

/**
 * The mascot and its hint, and nothing else: the texture tabs, the palette swatches
 * and the mood switcher that used to sit above it are gone. The moods are still all
 * there — they arrive on their own when you poke and pet it.
 *
 * `variant` is the one prop still passed, because the demo has always shown the
 * primary rind rather than the component's own default.
 */
export default function CalamansiDemo() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-4 sm:p-10">
      <Calamansi
        variant="primary"
        size={100}
        className="shrink-0 drop-shadow-sm transition-transform duration-200"
      />

      <p className="max-w-xs text-center text-[11px] font-medium leading-relaxed text-muted-foreground">
        Move cursor to track eyes. Pet back and forth to blush. Poke five times
        for tart mode. Press and hold to squish.
      </p>
    </div>
  );
}
