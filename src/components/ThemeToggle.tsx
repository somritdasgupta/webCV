import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "theme";

/**
 * Resolve the current background color from the design tokens, then push it
 * into the iOS/Android/Chrome status & toolbar tint. Done at runtime so the
 * bar matches the actual theme + scheme rather than a hardcoded value.
 */
const syncBrowserChrome = (theme: "light" | "dark") => {
  if (typeof document === "undefined") return;
  const styles = getComputedStyle(document.documentElement);
  const bg = styles.getPropertyValue("--background").trim();
  if (!bg) return;
  const color = `hsl(${bg})`;

  const upsertMeta = (name: string, attr: "name" | "property", media?: string) => {
    let el = document.querySelector<HTMLMetaElement>(
      `meta[${attr}="${name}"]${media ? `[media="${media}"]` : ":not([media])"}`,
    );
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute(attr, name);
      if (media) el.setAttribute("media", media);
      document.head.appendChild(el);
    }
    el.setAttribute("content", color);
  };

  upsertMeta("theme-color", "name");
  upsertMeta(
    "theme-color",
    "name",
    theme === "dark" ? "(prefers-color-scheme: dark)" : "(prefers-color-scheme: light)",
  );
  const apple = document.querySelector<HTMLMetaElement>(
    'meta[name="apple-mobile-web-app-status-bar-style"]',
  );
  if (apple) apple.setAttribute("content", "default");
  // Microsoft / older mobile chrome
  upsertMeta("msapplication-navbutton-color", "name");
};

function getInitial(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export const ThemeToggle = () => {
  const [theme, setTheme] = useState<"light" | "dark">(getInitial);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
    localStorage.setItem(STORAGE_KEY, theme);
    // Defer one frame so CSS variables have flushed before we read them.
    requestAnimationFrame(() => syncBrowserChrome(theme));
  }, [theme]);

  return (
    <button
      type="button"
      onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      className="relative inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-all duration-300 ease-out-expo hover:bg-secondary hover:text-foreground active:scale-95"
    >
      <Sun className="h-3.5 w-3.5 rotate-0 scale-100 transition-all duration-500 ease-out-expo dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-3.5 w-3.5 rotate-90 scale-0 transition-all duration-500 ease-out-expo dark:rotate-0 dark:scale-100" />
    </button>
  );
};
