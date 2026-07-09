import { useEffect, useRef, useState } from "react";
import { Moon, Sun, Monitor, Sunrise } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "theme";
type Mode = "light" | "dark" | "system" | "auto";

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

/** Auto: local hour 06:00–18:00 → light, else dark. */
const autoIsDark = () => {
  const h = new Date().getHours();
  return h < 6 || h >= 18;
};

function resolveEffective(mode: Mode): "light" | "dark" {
  if (mode === "light" || mode === "dark") return mode;
  if (mode === "system") return systemPrefersDark() ? "dark" : "light";
  return autoIsDark() ? "dark" : "light";
}

function getInitialMode(): Mode {
  if (typeof window === "undefined") return "system";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "system" || stored === "auto") return stored;
  return "system";
}

const ORDER: Mode[] = ["light", "dark", "system", "auto"];
const LABEL: Record<Mode, string> = {
  light: "Light",
  dark: "Dark",
  system: "System",
  auto: "Auto (time of day)",
};

export const ThemeToggle = () => {
  const [mode, setMode] = useState<Mode>(getInitialMode);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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
    // Poll every minute for the auto sunrise/sunset flip
    let timer: number | undefined;
    if (mode === "auto") {
      timer = window.setInterval(apply, 60_000);
    }
    return () => {
      if (mq) mq.removeEventListener("change", apply);
      if (timer) window.clearInterval(timer);
    };
  }, [mode]);

  // Close menu on outside click / escape
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const Icon = mode === "light" ? Sun : mode === "dark" ? Moon : mode === "system" ? Monitor : Sunrise;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Theme: ${LABEL[mode]}`}
        aria-haspopup="menu"
        aria-expanded={open}
        className="relative inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-all duration-300 ease-out-expo hover:bg-secondary hover:text-foreground active:scale-95"
      >
        <Icon className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-44 overflow-hidden rounded-xl border border-border/70 bg-popover/95 p-1 shadow-elev-lg backdrop-blur-xl"
        >
          {ORDER.map((m) => {
            const active = m === mode;
            const MIcon = m === "light" ? Sun : m === "dark" ? Moon : m === "system" ? Monitor : Sunrise;
            return (
              <button
                key={m}
                role="menuitemradio"
                aria-checked={active}
                type="button"
                onClick={() => {
                  setMode(m);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors",
                  active
                    ? "bg-surface-1 text-foreground"
                    : "text-muted-foreground hover:bg-surface-1 hover:text-foreground",
                )}
              >
                <MIcon className="h-3.5 w-3.5" />
                <span className="flex-1">{LABEL[m]}</span>
                {active && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
