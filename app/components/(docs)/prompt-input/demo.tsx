"use client";

import { useState } from "react";
import { Bot, ChevronDown, Sparkle } from "lucide-react";
import { PromptInput } from "@/components/ui/prompt-input";

export default function PromptInputDemo() {
  const [model, setModel] = useState("gemini-2.5-flash");
  const [submitted, setSubmitted] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (text: string) => {
    setSubmitted((prev) => [text, ...prev]);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 2500);
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 p-4 sm:p-10 max-w-2xl mx-auto">
      <div className="flex flex-col items-center gap-1.5 text-center">
        <p className="font-runde text-lg font-semibold tracking-tight text-foreground">
          AI Prompt Input
        </p>
        <p className="text-xs text-muted-foreground">
          Auto-expanding textarea, model selector pill, submit / stop state
          transitions.
        </p>
      </div>

      <PromptInput
        placeholder="Ask Calamansi agent or provide instructions..."
        isLoading={isLoading}
        onSubmit={handleSubmit}
        onStop={() => setIsLoading(false)}
        modelSelector={
          <div className="flex items-center gap-1.5 rounded-full border border-border/80 bg-muted/60 px-2.5 py-1 text-xs font-medium text-foreground/80">
            <Bot className="size-3.5 text-primary" />
            <span>{model}</span>
            <ChevronDown className="size-3 opacity-50" />
          </div>
        }
      />

      {/* Submitted Prompts Log */}
      {submitted.length > 0 && (
        <div className="w-full rounded-xl border border-border/60 bg-muted/30 p-3 text-xs flex flex-col gap-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="font-semibold uppercase tracking-wider text-[10px]">
              Prompt History
            </span>
            {isLoading && (
              <span className="flex items-center gap-1 text-primary">
                <span className="size-1.5 rounded-full bg-primary animate-ping" />
                Thinking...
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            {submitted.slice(0, 3).map((item, idx) => (
              <p
                key={idx}
                className="truncate rounded-md bg-card px-2.5 py-1.5 text-foreground/90 border border-border/40"
              >
                {item}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
