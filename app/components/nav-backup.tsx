"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  HiOutlineUser,
  HiOutlineDocumentText,
  HiOutlineCodeBracket,
} from "react-icons/hi2";
import { RiExternalLinkLine } from "react-icons/ri";
import { socialLinks } from "../lib/constants";

const navItems = {
  "/": {
    name: "about",
    icon: HiOutlineUser,
  },
  "/blog": {
    name: "writing",
    icon: HiOutlineDocumentText,
  },
  "/projects": {
    name: "code",
    icon: HiOutlineCodeBracket,
  },
  "/bookmarks": {
    name: "links",
    icon: RiExternalLinkLine,
  },
};

// Mobile Theme Switcher Component using the same logic as desktop
const MobileThemeSwitcher = () => {
  return (
    <div className="p-2">
      <ThemeSwitcher />
    </div>
  );
};

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
          {socialLinks.map((link) => (
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
        </nav>
      </motion.div>

      {/* Mobile - Compact Bottom Navigation */}
      <motion.div
        className={`lg:hidden transition-all duration-300 ${
          isScrolled
            ? "fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50"
            : "relative mb-3 mt-1"
        }`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <nav
          className={`flex items-center justify-between transition-all duration-300 ${
            isScrolled
              ? "bg-[var(--nav-pill)]/95 backdrop-blur-xl border border-[var(--callout-border)]/30 rounded-xl px-2 py-1 shadow-2xl"
              : "bg-[var(--callout-bg)]/50 backdrop-blur-sm border border-[var(--callout-border)]/30 rounded-xl px-2 py-1"
          }`}
        >
          <div className="flex items-center justify-between flex-1 space-x-1">
            {Object.entries(navItems).map(([path, { name, icon: Icon }]) => {
              const isActive = pathname === path;
              return (
                <Link
                  key={path}
                  href={path}
                  className={`flex-1 flex justify-center p-2 transition-all duration-200 rounded-lg ${
                    isActive
                      ? "text-[var(--bronzer)] bg-[var(--bronzer)]/15 scale-105"
                      : "text-[var(--text-p)]/70 hover:text-[var(--bronzer)] hover:bg-[var(--callout-border)]/20 hover:scale-105"
                  }`}
                  title={name}
                >
                  <Icon className="w-4 h-4" />
                </Link>
              );
            })}
          </div>
          <div className="ml-1 pl-1 border-l border-[var(--callout-border)]/30 flex-shrink-0">
            <MobileThemeSwitcher />
          </div>
        </nav>
      </motion.div>
    </>
  );
}
