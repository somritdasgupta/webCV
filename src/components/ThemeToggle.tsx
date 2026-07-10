import { useEffect, useState } from "react";
import { Moon, Sun, Monitor, Sunrise } from "lucide-react";

const STORAGE_KEY = "theme";
type Mode = "light" | "dark" | "system" | "timezone";

/**
 * Push the resolved background color into the OS status/toolbar chrome.
 */
const syncBrowserChrome = () => {
  if (typeof document === "undefined") return;
  const styles = getComputedStyle(document.documentElement);
  const bg = styles.getPropertyValue("--background").trim();
  if (!bg) return;
  const color = `hsl(${bg})`;
  const upsertMeta = (name: string, media?: string) => {
    let el = document.querySelector<HTMLMetaElement>(
      `meta[name="${name}"]${media ? `[media="${media}"]` : ":not([media])"}`,
    );
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute("name", name);
      if (media) el.setAttribute("media", media);
      document.head.appendChild(el);
    }
    el.setAttribute("content", color);
  };
  upsertMeta("theme-color");
  upsertMeta("theme-color", "(prefers-color-scheme: light)");
  upsertMeta("theme-color", "(prefers-color-scheme: dark)");
  upsertMeta("msapplication-navbutton-color");
};

const systemPrefersDark = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

/** Timezone mode: local hour 06:00–18:00 → light, else dark. */
const timezoneIsDark = () => {
  const h = new Date().getHours();
  return h < 6 || h >= 18;
};

function resolveEffective(mode: Mode): "light" | "dark" {
  if (mode === "light" || mode === "dark") return mode;
  if (mode === "system") return systemPrefersDark() ? "dark" : "light";
  return timezoneIsDark() ? "dark" : "light";
}

function getInitialMode(): Mode {
  if (typeof window === "undefined") return "system";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "auto") return "timezone";
  if (stored === "light" || stored === "dark" || stored === "system" || stored === "timezone") return stored;
  return "system";
}

const ORDER: Mode[] = ["light", "dark", "system", "timezone"];
const LABEL: Record<Mode, string> = {
  light: "Light",
  dark: "Dark",
  system: "System",
  timezone: "Timezone",
};

export const ThemeToggle = () => {
  const [mode, setMode] = useState<Mode>(getInitialMode);

  // Apply effective theme whenever mode changes, and re-apply on system/auto triggers.
  useEffect(() => {
    const apply = () => {
      const effective = resolveEffective(mode);
      const root = document.documentElement;
      root.classList.toggle("dark", effective === "dark");
      root.style.colorScheme = effective;
      requestAnimationFrame(syncBrowserChrome);
    };
    apply();
    localStorage.setItem(STORAGE_KEY, mode);

    // Live-follow system scheme
    let mq: MediaQueryList | null = null;
    if (mode === "system") {
      mq = window.matchMedia("(prefers-color-scheme: dark)");
      mq.addEventListener("change", apply);
    }
    // Poll every minute for the timezone sunrise/sunset flip.
    let timer: number | undefined;
    if (mode === "timezone") {
      timer = window.setInterval(apply, 60_000);
    }
    return () => {
      if (mq) mq.removeEventListener("change", apply);
      if (timer) window.clearInterval(timer);
    };
  }, [mode]);

  const nextMode = ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length];
  const Icon = mode === "light" ? Sun : mode === "dark" ? Moon : mode === "system" ? Monitor : Sunrise;

  return (
    <button
      type="button"
      onClick={() => setMode(nextMode)}
      aria-label={`Theme: ${LABEL[mode]}. Switch to ${LABEL[nextMode]}`}
      title={`${LABEL[mode]} theme`}
      className="relative inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full text-muted-foreground transition-all duration-300 ease-out-expo hover:bg-secondary hover:text-foreground active:scale-95"
    >
      <Icon key={mode} className="h-3.5 w-3.5 animate-scale-in" />
    </button>
  );
};
