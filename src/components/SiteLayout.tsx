import { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SiteNav } from "./SiteNav";
import { useLocation } from "react-router-dom";

export const SiteLayout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();

  return (
    <>
      {/* Ambient site-wide smoke — sits behind all content */}
      <div className="ambient-smoke" aria-hidden>
        <span />
      </div>
      <a
        href="#content"
        className="fixed left-3 top-3 z-[60] -translate-y-16 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground shadow-elev-md transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>
      {/* `vaul-drawer-wrapper` opts the whole page into vaul's 3D pushback:
          when a BottomSheet opens with shouldScaleBackground, this element
          gets scaled + translated so the sheet visibly floats above it. */}
      <div vaul-drawer-wrapper="" className="relative z-[1] flex min-h-screen flex-col">
        <SiteNav />
        {/* pt offset to clear the floating pill */}
        <main id="content" className="relative grid flex-1 grid-cols-1 content-start pt-16 sm:pt-20">
          <AnimatePresence initial={false} mode="sync">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10, scale: shouldReduceMotion ? 1 : 0.99, filter: shouldReduceMotion ? "blur(0px)" : "blur(6px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -6, scale: shouldReduceMotion ? 1 : 1.005, filter: shouldReduceMotion ? "blur(0px)" : "blur(4px)" }}
              transition={{ duration: shouldReduceMotion ? 0.12 : 0.48, ease: [0.22, 1, 0.36, 1] }}
              className="[grid-area:1/1]"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </>
  );
};
