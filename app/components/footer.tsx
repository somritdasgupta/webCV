"use client";

import { useEffect, useRef, useState } from "react";

export default function Footer() {
  const [atEnd, setAtEnd] = useState(false);
  const barRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const checkAtEnd = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const innerH = window.innerHeight;
      const docH = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
      );
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

  return (
    <>
      {/* Desktop footer */}
      <footer className="mb-8 hidden lg:flex">
        <div className="w-full max-w-8xl mx-auto px-4 md:px-8">
          <div className="flex flex-col items-center justify-center space-y-2 lg:space-y-0 lg:flex-row lg:gap-6 lg:justify-center">
            <p className="text-neutral-600 dark:text-neutral-400 text-sm">
              © {new Date().getFullYear()} somritdasgupta
            </p>
            <a
              href="/cv"
              className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-[var(--bronzer)] transition-colors"
            >
              cv
            </a>
          </div>
        </div>
      </footer>

      {/* Mobile: pill-style bar at bottom */}
      <div
        ref={barRef}
        className={`lg:hidden fixed bottom-2 left-0 right-0 z-50 flex justify-center pointer-events-none transition-all duration-300 ${
          atEnd ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <div className="w-full px-4 md:px-8 mx-auto max-w-8xl">
          <div className="pointer-events-auto nav-shimmer bg-[var(--nav-bg)]/95 backdrop-blur-md border border-[var(--nav-border)] rounded-2xl px-3 py-1 shadow-xl">
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs text-[var(--nav-text)] whitespace-nowrap">
                © {new Date().getFullYear()} somritdasgupta
              </span>
              <span className="text-[var(--nav-text)]/50">•</span>
              <a
                href="/cv"
                className="text-xs text-[var(--nav-text)] hover:text-[var(--nav-text-active)] transition-colors duration-150 whitespace-nowrap"
              >
                cv
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
