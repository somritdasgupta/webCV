"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import SocialLinks from "./SocialLinks";

const navItems = {
  "/": { name: "about" },
  "/blog": { name: "writing" },
  "/projects": { name: "code" },
  "/bookmarks": { name: "links" },
};

// Optimized animation variants
const desktopVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
};

const mobileVariants = {
  hidden: { opacity: 0, y: -50 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -50 },
};

const linkVariants = {
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
};

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const pathname = usePathname();

  // Memoize scroll handler to prevent unnecessary re-renders
  const handleScroll = useMemo(() => {
    let ticking = false;

    return () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          if (currentScrollY > lastScrollY && currentScrollY > 100) {
            setIsVisible(false);
          } else {
            setIsVisible(true);
          }

          setIsScrolled(currentScrollY > 20);
          setLastScrollY(currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
  }, [lastScrollY]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <>
      {/* Desktop Navigation */}
      <motion.div
        className="hidden lg:block fixed right-6 top-1/2 transform -translate-y-1/2 z-50"
        variants={desktopVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="relative">
          <div className="bg-[var(--nav-bg)]/95 backdrop-blur-md border border-[var(--nav-border)] rounded-2xl p-4 shadow-xl">
            <div className="flex flex-col space-y-2 items-end">
              {Object.entries(navItems).map(([path, { name }]) => {
                const isActive = pathname === path;
                return (
                  <motion.div
                    key={path}
                    variants={linkVariants}
                    whileHover="hover"
                    whileTap="tap"
                    transition={{ duration: 0.15, ease: "easeOut" }}
                  >
                    <Link
                      href={path}
                      className={`block px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 text-right min-w-[80px] relative ${
                        isActive
                          ? "bg-[var(--nav-pill-bg)] text-[var(--nav-text-active)] shadow-sm"
                          : "text-[var(--nav-text)] hover:bg-[var(--nav-pill-bg)]/50 hover:text-[var(--nav-text-hover)]"
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 rounded-xl bg-[var(--accent)]/8"
                          layoutId="desktopActiveTab"
                          transition={{ duration: 0.2, ease: "easeOut" }}
                        />
                      )}
                      <span className="relative z-10 capitalize">{name}</span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            <div className="my-3 h-px bg-[var(--nav-border)]/30" />

            <div className="flex justify-center">
              <ThemeSwitcher />
            </div>
          </div>

          <div className="mt-3 bg-[var(--nav-bg)]/95 backdrop-blur-md border border-[var(--nav-border)] rounded-xl p-2 shadow-xl">
            <SocialLinks variant="navbar" />
          </div>
        </div>
      </motion.div>

      {/* Mobile Navigation */}
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div
            className="lg:hidden fixed top-4 left-4 right-4 z-50"
            variants={mobileVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div
              className={`bg-[var(--nav-bg)]/95 backdrop-blur-md border border-[var(--nav-border)] rounded-2xl px-3 py-2 shadow-xl transition-all duration-200 ${
                isScrolled
                  ? "shadow-black/10 dark:shadow-black/40"
                  : "shadow-black/5 dark:shadow-black/20"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  {Object.entries(navItems).map(([path, { name }]) => {
                    const isActive = pathname === path;
                    return (
                      <motion.div
                        key={path}
                        variants={linkVariants}
                        whileHover="hover"
                        whileTap="tap"
                        transition={{ duration: 0.15, ease: "easeOut" }}
                      >
                        <Link
                          href={path}
                          className={`flex items-center justify-center px-3 py-1.5 rounded-xl transition-colors duration-200 relative ${
                            isActive
                              ? "bg-[var(--nav-pill-bg)] text-[var(--nav-text-active)] shadow-sm"
                              : "text-[var(--nav-text)] hover:bg-[var(--nav-pill-bg)]/50 hover:text-[var(--nav-text-hover)]"
                          }`}
                        >
                          {isActive && (
                            <motion.div
                              className="absolute inset-0 rounded-xl bg-[var(--accent)]/5"
                              layoutId="mobileActiveTab"
                              transition={{ duration: 0.2, ease: "easeOut" }}
                            />
                          )}
                          <span className="relative z-10 capitalize text-xs font-medium">
                            {name}
                          </span>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="flex items-center">
                  <ThemeSwitcher />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="lg:hidden h-16" />
    </>
  );
}
