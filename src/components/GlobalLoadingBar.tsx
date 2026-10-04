import { useEffect, useRef, useState } from "react";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { beginLoading, usePendingCount } from "@/lib/loading/loading-store";
import { cn } from "@/lib/utils";

type Step = 0 | 25 | 50 | 75 | 100;

const SHOW_DELAY_MS = 150;
const STEP_TIMINGS: [number, Step][] = [[0, 25], [450, 50], [1300, 75]];

/** Centered translucent sky-blue bar that fills in 25 / 50 / 75 / 100 steps. */
export const GlobalLoadingBar = () => {
  const isActive = usePendingCount() + useIsFetching() + useIsMutating() > 0;
  const [step, setStep] = useState<Step>(0);
  const [isVisible, setIsVisible] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    const schedule = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
    if (isActive) {
      schedule(() => setIsVisible(true), SHOW_DELAY_MS);
      STEP_TIMINGS.forEach(([ms, value]) => schedule(() => setStep(value), SHOW_DELAY_MS + ms));
    } else {
      setStep((current) => (current === 0 ? 0 : 100));
      schedule(() => setIsVisible(false), 380);
      schedule(() => setStep(0), 700);
    }
    return () => timers.current.forEach(clearTimeout);
  }, [isActive]);

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
      <div className="h-1.5 w-40 overflow-hidden rounded-full border border-sky/30 bg-sky/10 shadow-elev-md backdrop-blur-md sm:w-48">
        <div
          className="h-full rounded-full bg-sky/80 transition-[width] duration-500 ease-out-expo"
          style={{ width: `${step}%` }}
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
