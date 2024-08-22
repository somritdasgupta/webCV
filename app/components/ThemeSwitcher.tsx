"use client";

import { useState, useEffect } from "react";
import { FiSun, FiMoon } from "react-icons/fi";

interface ThemeSwitcherProps {
  className?: string;
}

export function ThemeSwitcher({ className = "" }: ThemeSwitcherProps) {
  const [isDarkMode, setIsDarkMode] = useState<boolean | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setIsDarkMode(savedTheme === "dark");
      updateTheme(savedTheme === "dark");
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setIsDarkMode(prefersDark);
      updateTheme(prefersDark);
    }
  }, []);

  const updateTheme = (isDark: boolean) => {
    const newTheme = isDark ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", newTheme);
    document.documentElement.style.setProperty("color-scheme", newTheme);
    if (isDark) {
      document.documentElement.classList.add("dark");
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute("content", "#0a0310");
    } else {
      document.documentElement.classList.remove("dark");
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute("content", "#fffbfb");
    }
  };

  const toggleTheme = () => {
    const newIsDarkMode = !isDarkMode;
    setIsDarkMode(newIsDarkMode);
    updateTheme(newIsDarkMode);
    localStorage.setItem("theme", newIsDarkMode ? "dark" : "light");
  };

  if (isDarkMode === null) {
    return (
      <span
        className={`py-2 px-1.5 text-violet-400 animate-ping ${className}`}
      >
        ⦿
      </span>
    );
  } else {
    return (
      <span
        onClick={toggleTheme}
        className={`py-2.5 px-1 cursor-pointer text-xl ${className}`}
        role="button"
        tabIndex={0}
        aria-label="Toggle theme"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            toggleTheme();
          }
        }}
      >
        {isDarkMode ? (
          <FiSun className="text-xl text-violet-400 transition-all ease-out duration-600" />
        ) : (
          <FiMoon className="text-xl text-violet-400 transition-all ease-out duration-600" />
        )}
      </span>
    );
  }
}
