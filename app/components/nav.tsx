"use client";

import Link from "next/link";
import { useEffect, useState, useRef, useCallback } from "react";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import SocialLinks from "./SocialLinks";

const navItems = {
  "/": { name: "about" },
  "/blog": { name: "writing" },
  "/projects": { name: "code" },
  "/activity": { name: "activity" },
  "/bookmarks": { name: "bookmarked" },
};

// Optimized animation variants
const desktopVariants = {
  hidden: { opacity: 0, x: 18 },
  visible: { opacity: 1, x: 0 },
};

const mobileVariants = {
  hidden: { opacity: 0, y: -30 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -24 },
};

const linkVariants = {
  hover: { scale: 1.03 },
  tap: { scale: 0.985 },
};

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  // useRef for lastScrollY + ticking to avoid re-renders and stable handler
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const pathname = usePathname();

  // Stable scroll handler using refs + useCallback for better performance
  const handleScroll = useCallback(() => {
    if (ticking.current) return;

    ticking.current = true;
    requestAnimationFrame(() => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setIsScrolled(currentScrollY > 20);
      lastScrollY.current = currentScrollY;
      ticking.current = false;
    });
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <>
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div
            className="fixed top-2 left-0 right-0 z-50 flex justify-center"
            variants={mobileVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            <div className="w-full px-4 md:px-8 mx-auto max-w-8xl">
              <div
                className={`nav-shimmer bg-[var(--nav-bg)]/95 backdrop-blur-md border border-[var(--nav-border)] rounded-2xl px-3 py-1 shadow-xl transition-all duration-150 overflow-hidden ${
                  isScrolled
                    ? "shadow-black/10 dark:shadow-black/40"
                    : "shadow-black/5 dark:shadow-black/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {Object.entries(navItems).map(([path, { name }]) => {
                      const isActive = pathname === path;
                      return (
                        <motion.div
                          key={path}
                          variants={linkVariants}
                          whileHover="hover"
                          whileTap="tap"
                          transition={{ duration: 0.12, ease: "easeOut" }}
                        >
                          <Link
                            href={path}
                            aria-current={isActive ? "page" : undefined}
                            className={`flex items-center justify-center px-2 py-0.5 rounded-md transition-all duration-150 relative ${
                              isActive
                                ? "text-[var(--nav-text-active)] font-extrabold text-sm scale-[1.02]"
                                : "text-[var(--nav-text)] hover:text-[var(--nav-text-hover)]"
                            }`}
                          >
                            <span className="relative z-10 lowercase text-xs">
                              {name}
                            </span>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>

                  <div className="flex items-center space-x-2">
                    <a
                      href="/Resume.pdf"
                      className="hidden sm:inline-flex items-center justify-center h-6 px-2 text-[var(--nav-text)]/75 hover:text-[var(--nav-text-active)] transition-colors duration-150 rounded-md text-xs"
                    >
                      resume
                    </a>
                    <div className="ml-2">
                      <ThemeSwitcher compact />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={
          pathname === "/" ? "h-8 md:h-10 lg:h-8" : "h-12 md:h-16 lg:h-12"
        }
      />
    </>
  );
}
