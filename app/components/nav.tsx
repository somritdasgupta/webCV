"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { socialLinks } from "../lib/constants";

const navItems = {
  "/": { name: "about" },
  "/blog": { name: "writing" },
  "/projects": { name: "code" },
  "/bookmarks": { name: "links" },
};

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setIsScrolled(currentScrollY > 20);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <>
      {/* Desktop Navigation */}
      <motion.div
        className="hidden lg:block fixed right-6 top-1/2 transform -translate-y-1/2 z-50"
        initial={{ opacity: 0, x: 20, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="relative">
          <div className="backdrop-blur-xl bg-[var(--nav-bg)] border border-[var(--nav-border)] rounded-2xl p-4 shadow-lg shadow-black/5 dark:shadow-black/20">
            <div className="flex flex-col space-y-3 items-end">
              {Object.entries(navItems).map(([path, { name }]) => {
                const isActive = pathname === path;
                return (
                  <motion.div
                    key={path}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                  >
                    <Link
                      href={path}
                      className={`block px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 text-right min-w-[80px] ${
                        isActive
                          ? "bg-[var(--nav-pill-bg)] border border-[var(--nav-pill-border)] text-[var(--nav-text-active)] shadow-lg backdrop-blur-sm"
                          : "text-[var(--nav-text)] hover:bg-[var(--nav-pill-bg)] hover:border hover:border-[var(--nav-pill-border)] hover:text-[var(--nav-text-hover)] hover:backdrop-blur-sm"
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 rounded-xl bg-[var(--accent)]/10"
                          layoutId="activeTab"
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                        />
                      )}
                      <span className="relative z-10 capitalize">{name}</span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            <div className="my-4 h-px bg-gradient-to-r from-transparent via-[var(--nav-border)] to-transparent" />

            <div className="flex justify-center">
              <div className="p-1">
                <ThemeSwitcher />
              </div>
            </div>
          </div>

          <motion.div
            className="mt-4 backdrop-blur-xl bg-[var(--nav-bg)] border border-[var(--nav-border)] rounded-xl p-2 shadow-lg shadow-black/5 dark:shadow-black/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.2,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          >
            <div className="flex flex-col space-y-1">
              {socialLinks.slice(0, 3).map((link, index) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noopener noreferrer" : undefined}
                  className="flex items-center justify-center w-full h-8 text-xs text-[var(--nav-text)]/70 hover:text-[var(--nav-text-active)] hover:bg-[var(--nav-pill-bg)] rounded-lg transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                >
                  {link.name}
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="lg:hidden fixed top-4 left-4 right-4 z-50"
            initial={{ opacity: 0, y: -100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -100, scale: 0.95 }}
            transition={{
              duration: 0.5,
              ease: [0.25, 0.46, 0.45, 0.94],
              type: "spring",
              stiffness: 100,
              damping: 15,
            }}
          >
            <div
              className={`backdrop-blur-xl border rounded-2xl px-4 py-2 shadow-2xl transition-all duration-300 ${
                isScrolled
                  ? "bg-[var(--nav-bg)] border-[var(--nav-border)] shadow-black/10 dark:shadow-black/40"
                  : "bg-[var(--nav-bg-blur)] border-[var(--nav-border)] shadow-black/5 dark:shadow-black/20"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {Object.entries(navItems).map(([path, { name }], index) => {
                    const isActive = pathname === path;
                    return (
                      <motion.div
                        key={path}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          duration: 0.3,
                          delay: 0.05 + index * 0.05,
                          ease: [0.25, 0.46, 0.45, 0.94],
                        }}
                      >
                        <Link
                          href={path}
                          className={`flex items-center justify-center px-3 py-2 rounded-xl transition-all duration-200 group ${
                            isActive
                              ? "bg-[var(--nav-pill-bg)] border border-[var(--nav-pill-border)] text-[var(--nav-text-active)] shadow-sm"
                              : "text-[var(--nav-text)] hover:bg-[var(--nav-pill-bg)] hover:border hover:border-[var(--nav-pill-border)] hover:text-[var(--nav-text-hover)] hover:scale-105"
                          }`}
                        >
                          {isActive && (
                            <motion.div
                              className="absolute inset-0 rounded-xl bg-[var(--accent)]/5"
                              layoutId="mobileActiveTab"
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                            />
                          )}
                          <span className="relative z-10 capitalize text-sm font-medium">
                            {name}
                          </span>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>

                <motion.div
                  className="flex items-center relative z-20"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <div className="p-2 -m-2 min-w-[44px] min-h-[44px] flex items-center justify-center">
                    <ThemeSwitcher />
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="lg:hidden h-16" />
    </>
  );
}
