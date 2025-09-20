"use client";

import { useEffect, useRef, useState } from "react";
import SocialLinks from "./SocialLinks";

export default function Footer() {
  const [atEnd, setAtEnd] = useState(false);
  const footerRef = useRef<HTMLElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Fallback to scroll-based detection so the footer bar appears reliably on mobile.
    const checkAtEnd = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const innerH = window.innerHeight;
      const docH = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight
      );
      // consider within 72px of bottom as "at end"
      const nearEnd = innerH + scrollY >= docH - 72;
      setAtEnd(nearEnd);
    };

    checkAtEnd();
    window.addEventListener("scroll", checkAtEnd, { passive: true });
    window.addEventListener("resize", checkAtEnd);
    return () => {
      window.removeEventListener("scroll", checkAtEnd);
      window.removeEventListener("resize", checkAtEnd);
    };
  }, []);

  useEffect(() => {
    // One-time marquee: when user reaches end and content overflows, scroll to end and back once.
    const el = barRef.current?.querySelector(
      ".hide-scrollbar"
    ) as HTMLElement | null;
    if (!el) return;

    const storageKey = "footerMarqueeShown";
    const hasRun = sessionStorage.getItem(storageKey) === "1";
    if (hasRun) return;

    if (atEnd && el.scrollWidth > el.clientWidth) {
      // mark as run in session storage so it won't run again in this session
      try {
        sessionStorage.setItem(storageKey, "1");
      } catch (e) {}

      // wait a tick so the bar has animated into view
      const startDelay = 260;
      const pause = 700;

      const performMarquee = async () => {
        await new Promise((r) => setTimeout(r, startDelay));

        const maxScroll = el.scrollWidth - el.clientWidth;
        if (maxScroll <= 2) return;

        // estimate duration based on distance (px): ~0.6ms per px
        const durationToEnd = Math.max(400, Math.round(maxScroll * 0.6));

        // scroll to end
        el.scrollTo({ left: maxScroll, behavior: "smooth" });
        await new Promise((r) => setTimeout(r, durationToEnd + 80));

        // pause at end
        await new Promise((r) => setTimeout(r, pause));

        // scroll back to start
        el.scrollTo({ left: 0, behavior: "smooth" });
        await new Promise((r) => setTimeout(r, durationToEnd + 80));
      };

      performMarquee().catch(() => {});
    }
  }, [atEnd]);

  return (
    <>
      {/* Desktop footer: show navbar-style social links on the right to match mobile pill */}
      <footer ref={footerRef} className="mb-8 hidden lg:flex">
        <div className="w-full max-w-8xl mx-auto px-4 md:px-8">
          {/* Centered footer: stack vertically on small, row centered on large */}
          <div className="flex flex-col items-center justify-center space-y-2 lg:space-y-0 lg:flex-row lg:gap-6 lg:justify-center">
            <p className="text-neutral-600 dark:text-neutral-400 text-sm">
              © {new Date().getFullYear()} somritdasgupta
            </p>
            <div className="flex items-center">
              <SocialLinks variant="navbar" />
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile: pill-style bar at bottom that shows when scrolled to page end */}
      <div
        ref={barRef}
        className={`lg:hidden fixed bottom-4 left-4 right-4 z-50 flex justify-center pointer-events-none transition-all duration-300 ${
          atEnd ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <div className="pointer-events-auto w-full max-w-3xl mx-auto">
          <div className="nav-shimmer bg-[var(--nav-bg)]/95 backdrop-blur-md border border-[var(--nav-border)] rounded-2xl px-3 py-1 shadow-xl overflow-hidden">
            <div className="flex items-center justify-center">
              <div className="w-full overflow-x-auto hide-scrollbar">
                {/* use navbar variant so the mobile footer items match the desktop navbar items */}
                <SocialLinks variant="navbar" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
