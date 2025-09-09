"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const navItems = {
  "/": {
    name: "about",
  },
  "/blog": {
    name: "writing",
  },
  "/projects": {
    name: "code",
  },
};

const footerLinks = [
  { name: "github", href: "https://github.com/somritdasgupta", external: true },
  {
    name: "linkedin",
    href: "https://www.linkedin.com/in/somritdasgupta",
    external: true,
  },
  {
    name: "instagram",
    href: "https://www.instagram.com/somritdasgupta",
    external: true,
  },
  { name: "resume", href: "/Resume.pdf", external: true },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Desktop - Center Right with Zoom Dial Effects */}
      <motion.div
        className="hidden lg:block fixed right-8 top-1/2 transform -translate-y-1/2 z-50"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <nav className="flex flex-col items-end space-y-3 text-right">
          {/* Main Navigation */}
          {Object.entries(navItems).map(([path, { name }]) => {
            const isActive = pathname === path;
            return (
              <motion.div
                key={path}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href={path}
                  className={`block text-lg transition-all duration-200 ${
                    isActive
                      ? "text-[var(--bronzer)] font-bold scale-110 transform"
                      : "text-[var(--text-p)] hover:text-[var(--bronzer)] font-medium hover:font-bold"
                  }`}
                  style={{
                    transform: isActive ? "scale(1.1)" : "scale(1)",
                  }}
                >
                  {name}
                </Link>
              </motion.div>
            );
          })}

          {/* Theme Switcher */}
          <div className="my-4 py-3 border-y border-[var(--callout-border)]/30">
            <ThemeSwitcher />
          </div>

          {/* Footer Links */}
          {footerLinks.map((link) => (
            <motion.a
              key={link.name}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              className="text-sm text-[var(--text-p)]/70 hover:text-[var(--text-p)] transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {link.name}
            </motion.a>
          ))}

          {/* Copyright */}
          <div className="mt-4 pt-3 border-t border-[var(--callout-border)]/30">
            <p className="text-xs text-[var(--text-p)]/50">© 2024 somrit</p>
          </div>
        </nav>
      </motion.div>

      {/* Mobile - Adaptive positioning */}
      <motion.div
        className={`lg:hidden transition-all duration-300 ${
          isScrolled
            ? "fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
            : "relative mb-6 mt-2"
        }`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <nav
          className={`flex items-center justify-between transition-all duration-300 ${
            isScrolled
              ? "bg-[var(--nav-pill)]/95 backdrop-blur-md border border-[var(--callout-border)]/40 rounded-full px-6 py-3 shadow-xl min-w-fit"
              : "bg-transparent px-2 py-2"
          }`}
        >
          <div className="flex items-center space-x-8">
            {Object.entries(navItems).map(([path, { name }]) => {
              const isActive = pathname === path;
              return (
                <Link
                  key={path}
                  href={path}
                  className={`text-base font-medium transition-all duration-200 ${
                    isActive
                      ? "text-[var(--bronzer)]"
                      : "text-[var(--text-p)] hover:text-[var(--bronzer)]"
                  }`}
                >
                  {name}
                </Link>
              );
            })}
          </div>
          <div
            className={`transition-all duration-300 ${
              isScrolled
                ? "ml-6 pl-4 border-l border-[var(--callout-border)]/40"
                : "ml-8"
            }`}
          >
            <ThemeSwitcher />
          </div>
        </nav>
      </motion.div>
    </>
  );
}
