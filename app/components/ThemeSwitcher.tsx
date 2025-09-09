"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ThemeSwitcherProps {
  className?: string;
}

export function ThemeSwitcher({ className = "" }: ThemeSwitcherProps) {
  const [isDarkMode, setIsDarkMode] = useState<boolean | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setIsDarkMode(savedTheme === "dark");
      updateTheme(savedTheme === "dark", false);
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setIsDarkMode(prefersDark);
      updateTheme(prefersDark, false);
    }
  }, []);

  const updateTheme = (isDark: boolean, animate: boolean = true) => {
    const newTheme = isDark ? "dark" : "light";

    if (animate) {
      // Add transition class to body for smooth theme switching
      document.body.style.transition =
        "background-color 0.3s ease, color 0.3s ease";
      document.documentElement.style.transition =
        "background-color 0.3s ease, color 0.3s ease";
    }

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

    // Force update all CSS custom properties immediately
    const root = document.documentElement;
    if (isDark) {
      root.style.setProperty("--bg-color", "#151217");
      root.style.setProperty("--text-color", "#fefefe");
      root.style.setProperty("--text-p", "#a0c0be");
      root.style.setProperty("--bronzer", "#a78bfa");
      root.style.setProperty("--callout-bg", "#1f293493");
      root.style.setProperty("--callout-border", "#322d47");
      root.style.setProperty("--card-bg", "#1f293493");
      root.style.setProperty("--nav-pill", "#181120");
    } else {
      root.style.setProperty("--bg-color", "#fffbfb");
      root.style.setProperty("--text-color", "#471919");
      root.style.setProperty("--text-p", "#6a2a2a");
      root.style.setProperty("--bronzer", "#2e6754");
      root.style.setProperty("--callout-bg", "#fbf7f7");
      root.style.setProperty("--callout-border", "#c8c8c8b3");
      root.style.setProperty("--card-bg", "#f1f1f1e6");
      root.style.setProperty("--nav-pill", "#f6f8ff");
    }

    if (animate) {
      // Remove transition after animation completes
      setTimeout(() => {
        document.body.style.transition = "";
        document.documentElement.style.transition = "";
      }, 300);
    }
  };

  const createSlideTransition = (isDark: boolean) => {
    return new Promise<void>((resolve) => {
      // Create sliding panels
      const panels: HTMLDivElement[] = [];
      const numPanels = 5;

      for (let i = 0; i < numPanels; i++) {
        const panel = document.createElement("div");
        const delay = i * 80;
        const direction = i % 2 === 0 ? 1 : -1;

        panel.style.cssText = `
          position: fixed;
          top: 0;
          left: ${(i * window.innerWidth) / numPanels}px;
          width: ${window.innerWidth / numPanels + 2}px;
          height: 100vh;
          background: ${
            isDark
              ? `linear-gradient(45deg, #1e1b4b 0%, #312e81 30%, #4c1d95 60%, #6b21a8 100%)`
              : `linear-gradient(45deg, #f59e0b 0%, #d97706 30%, #b45309 60%, #92400e 100%)`
          };
          z-index: 10000;
          transform: translateY(${direction > 0 ? "-100%" : "100%"});
          pointer-events: none;
        `;

        document.body.appendChild(panel);
        panels.push(panel);

        setTimeout(() => {
          panel.animate(
            [
              { transform: `translateY(${direction > 0 ? "-100%" : "100%"})` },
              { transform: "translateY(0%)" },
              { transform: `translateY(${direction > 0 ? "100%" : "-100%"})` },
            ],
            {
              duration: 600,
              easing: "cubic-bezier(0.23, 1, 0.32, 1)",
            }
          ).onfinish = () => {
            panel.remove();
            if (panels.every((p) => !document.body.contains(p))) {
              resolve();
            }
          };
        }, delay);
      }

      // Create geometric shapes overlay
      setTimeout(() => {
        for (let i = 0; i < 8; i++) {
          const shape = document.createElement("div");
          const size = Math.random() * 60 + 20;
          const isCircle = Math.random() > 0.5;

          shape.style.cssText = `
            position: fixed;
            width: ${size}px;
            height: ${size}px;
            background: ${isDark ? "#a78bfa" : "#f59e0b"};
            ${isCircle ? "border-radius: 50%;" : "transform: rotate(45deg);"}
            top: ${Math.random() * window.innerHeight}px;
            left: ${Math.random() * window.innerWidth}px;
            z-index: 10001;
            opacity: 0;
            pointer-events: none;
          `;

          document.body.appendChild(shape);

          shape.animate(
            [
              {
                opacity: 0,
                transform: `scale(0) ${isCircle ? "" : "rotate(45deg)"}`,
              },
              {
                opacity: 0.8,
                transform: `scale(1) ${isCircle ? "" : "rotate(90deg)"}`,
              },
              {
                opacity: 0,
                transform: `scale(0) ${isCircle ? "" : "rotate(135deg)"}`,
              },
            ],
            {
              duration: 800,
              delay: i * 50,
              easing: "ease-out",
            }
          ).onfinish = () => shape.remove();
        }
      }, 200);

      // Fallback resolve
      setTimeout(resolve, 1000);
    });
  };

  const toggleTheme = async () => {
    if (isAnimating) return;

    setIsAnimating(true);
    const newIsDarkMode = !isDarkMode;

    // Start the slide transition
    const transitionPromise = createSlideTransition(newIsDarkMode);

    // Update theme immediately for smooth transition
    setTimeout(() => {
      setIsDarkMode(newIsDarkMode);
      updateTheme(newIsDarkMode, true);
      localStorage.setItem("theme", newIsDarkMode ? "dark" : "light");
    }, 200);

    await transitionPromise;
    setIsAnimating(false);
  };

  if (isDarkMode === null) {
    return (
      <motion.div
        className={`text-sm text-[var(--text-p)]/50 ${className}`}
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        •
      </motion.div>
    );
  }

  return (
    <motion.button
      onClick={toggleTheme}
      disabled={isAnimating}
      className={`text-base font-medium transition-all duration-200 ${
        isAnimating
          ? "opacity-60 cursor-not-allowed"
          : "text-[var(--text-p)] hover:text-[var(--bronzer)]"
      } ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={isDarkMode ? "dark" : "light"}
          initial={{ opacity: 0, rotateX: 90 }}
          animate={{ opacity: 1, rotateX: 0 }}
          exit={{ opacity: 0, rotateX: -90 }}
          transition={{ duration: 0.3 }}
        >
          {isDarkMode ? "light" : "dark"}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
