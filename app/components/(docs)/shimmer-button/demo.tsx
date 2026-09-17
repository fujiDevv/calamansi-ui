"use client";

import { useState } from "react";
import { ArrowRight, Citrus, Sparkles, Zap } from "lucide-react";
import { ShimmerButton } from "@/components/ui/shimmer-button";

export default function ShimmerButtonDemo() {
  const [clicked, setClicked] = useState(0);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 p-4 sm:gap-8 sm:p-12">
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="font-runde text-lg font-semibold tracking-tight text-foreground">
          Tactile Shimmer Action Buttons
        </p>
        <p className="text-xs text-muted-foreground max-w-sm">
          A continuous high-velocity border beam with spring squash on click and
          ambient glow.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5">
        {/* Calamansi Lime Glow */}
        <ShimmerButton
          shimmerColor="var(--primary, #b4e84c)"
          onClick={() => setClicked((c) => c + 1)}
        >
          <Citrus className="size-4 text-primary" />
          <span>Get Calamansi</span>
          <ArrowRight className="size-4 opacity-70 transition-transform group-hover:translate-x-0.5" />
        </ShimmerButton>

        {/* Orange Pulp Glow */}
        <ShimmerButton
          shimmerColor="#ff9e3d"
          shimmerDuration={2.2}
          onClick={() => setClicked((c) => c + 1)}
        >
          <Zap className="size-4 text-[#ff9e3d]" />
          <span>Deploy Worker</span>
        </ShimmerButton>

        {/* Cheek Blush Glow */}
        <ShimmerButton
          shimmerColor="#ff7e9d"
          shimmerDuration={3.5}
          borderRadius="12px"
          onClick={() => setClicked((c) => c + 1)}
        >
          <span>Explore Registry</span>
        </ShimmerButton>
      </div>

      {clicked > 0 && (
        <p className="text-xs font-mono text-muted-foreground">
          Clicks registered:{" "}
          <span className="font-semibold text-foreground">{clicked}</span>
        </p>
      )}
    </div>
  );
}
