import { useEffect, useRef, useState } from "react";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { beginLoading, useLoadingSnapshot } from "@/lib/loading/loading-store";
import { cn } from "@/lib/utils";

type Step = 0 | 25 | 50 | 75 | 100;

const STEP_WIDTH: Record<Step, string> = { 0: "w-0", 25: "w-1/4", 50: "w-1/2", 75: "w-3/4", 100: "w-full" };
const SHOW_DELAY_MS = 150;
/** Steps advance only as tracked work completes; 100 means all work has settled. */
export const GlobalLoadingBar = () => {
  const [pending, started, completed] = useLoadingSnapshot().split(":").map(Number);
  const isActive = pending + useIsFetching() + useIsMutating() > 0;
  const [step, setStep] = useState<Step>(0);
  const [isVisible, setIsVisible] = useState(false);
  const hideTimer = useRef<number | undefined>();

  useEffect(() => {
    clearTimeout(hideTimer.current);
    if (isActive) {
      setStep(started > 0 ? (Math.min(75, Math.max(25, Math.floor((completed / started) * 4) * 25)) as Step) : 25);
      hideTimer.current = window.setTimeout(() => setIsVisible(true), SHOW_DELAY_MS);
    } else {
      setStep((current) => (current === 0 ? 0 : 100));
      hideTimer.current = window.setTimeout(() => { setIsVisible(false); setStep(0); }, 280);
    }
    return () => clearTimeout(hideTimer.current);
  }, [isActive, started, completed]);

  return (
    <div
      role="progressbar"
      aria-label="Loading"
      aria-hidden={!isVisible}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={step}
      className={cn(
        "pointer-events-none fixed left-1/2 top-1/2 z-[100] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300",
        isVisible ? "opacity-100" : "opacity-0",
      )}
    >
      <div className="h-1.5 w-40 overflow-hidden rounded-full border border-foreground/20 bg-background/60 shadow-elev-md backdrop-blur-md sm:w-48">
        <div
          className={cn("h-full rounded-full bg-foreground/65 transition-[width] duration-200 ease-out-expo", STEP_WIDTH[step])}
        />
      </div>
    </div>
  );
};

/** Suspense fallback that feeds the global bar instead of rendering text. */
export const LoadingFallback = () => {
  useEffect(() => beginLoading(), []);
  return null;
};
