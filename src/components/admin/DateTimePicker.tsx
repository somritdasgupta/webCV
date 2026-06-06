/**
 * Date + time + timezone picker for the editor.
 *
 * Layout:
 *   ┌─ Status header (immediate vs scheduled) ─┐
 *   │  Quick presets (Now / +1h / Tomorrow…)   │
 *   ├──────────────────────────────────────────┤
 *   │             Centered calendar             │
 *   ├──────────────────────────────────────────┤
 *   │  ⏰ Time     │  Timezone (collapsible)    │
 *   ├──────────────────────────────────────────┤
 *   │  UTC stamp                       [Done]   │
 *   └──────────────────────────────────────────┘
 *
 * Desktop = centered modal, Mobile/Tablet = bottom sheet with handle.
 */
import { useMemo, useState } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  Globe,
  Zap,
  Search,
  ChevronRight,
  Check,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { BottomSheet } from "@/components/ui/bottom-sheet";

/* ── TZ helpers ───────────────────────────────────────────────── */

function tzOffsetMin(tz: string, utcMs: number): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = dtf.formatToParts(new Date(utcMs));
  const get = (t: string) => Number(parts.find((p) => p.type === t)!.value);
  const asUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour") === 24 ? 0 : get("hour"),
    get("minute"),
    get("second"),
  );
  return (asUtc - utcMs) / 60000;
}

function utcToWall(iso: string, tz: string) {
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)!.value;
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    time: `${get("hour") === "24" ? "00" : get("hour")}:${get("minute")}`,
  };
}

function wallToUtcIso(date: string, time: string, tz: string): string {
  const guess = new Date(`${date}T${time}:00Z`).getTime();
  const offset = tzOffsetMin(tz, guess);
  let utc = guess - offset * 60000;
  const offset2 = tzOffsetMin(tz, utc);
  if (offset2 !== offset) utc = guess - offset2 * 60000;
  return new Date(utc).toISOString();
}

function tzShort(tz: string, utcMs: number): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "short",
    }).formatToParts(new Date(utcMs));
    return parts.find((p) => p.type === "timeZoneName")?.value ?? tz;
  } catch {
    return tz;
  }
}

export const localTz = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
};

const TZ_FALLBACK = [
  "UTC", "America/Los_Angeles", "America/Denver", "America/Chicago",
  "America/New_York", "America/Sao_Paulo", "Europe/London", "Europe/Paris",
  "Europe/Berlin", "Africa/Cairo", "Asia/Dubai", "Asia/Kolkata",
  "Asia/Singapore", "Asia/Tokyo", "Australia/Sydney", "Pacific/Auckland",
];

const allZones = (): string[] => {
  type IntlExt = { supportedValuesOf?: (k: string) => string[] };
  const fn = (Intl as unknown as IntlExt).supportedValuesOf;
  if (typeof fn === "function") {
    try { return fn("timeZone"); } catch { /* fall through */ }
  }
  return TZ_FALLBACK;
};

/* ── Presets ──────────────────────────────────────────────────── */

type Preset = { label: string; build: () => Date; primary?: boolean };

const PRESETS: Preset[] = [
  { label: "Now", build: () => new Date(), primary: true },
  { label: "+1 hour", build: () => new Date(Date.now() + 60 * 60 * 1000) },
  {
    label: "Tomorrow 9am",
    build: () => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      d.setHours(9, 0, 0, 0);
      return d;
    },
  },
  {
    label: "Next Mon 9am",
    build: () => {
      const d = new Date();
      const day = d.getDay();
      const delta = ((1 - day + 7) % 7) || 7;
      d.setDate(d.getDate() + delta);
      d.setHours(9, 0, 0, 0);
      return d;
    },
  },
];

/* ── Component ────────────────────────────────────────────────── */

export interface DateTimePickerProps {
  value: string;
  onChange: (isoUtc: string) => void;
  timezone: string;
  onTimezoneChange: (tz: string) => void;
  className?: string;
}

export function DateTimePicker({
  value, onChange, timezone, onTimezoneChange, className,
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [tzQuery, setTzQuery] = useState("");
  const [tzPickerOpen, setTzPickerOpen] = useState(false);
  const wall = useMemo(() => utcToWall(value, timezone), [value, timezone]);

  const wallDateObj = useMemo(() => {
    const [y, m, d] = wall.date.split("-").map(Number);
    return new Date(y, m - 1, d);
  }, [wall.date]);

  const updateWall = (date: string, time: string) => {
    onChange(wallToUtcIso(date, time, timezone));
  };

  const applyPreset = (p: Preset) => {
    onChange(p.build().toISOString());
  };

  const triggerLabel = useMemo(() => {
    const d = new Date(value);
    const fmt = new Intl.DateTimeFormat(undefined, {
      timeZone: timezone, month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
    return `${fmt.format(d)} · ${tzShort(timezone, d.getTime())}`;
  }, [value, timezone]);

  const zones = useMemo(() => allZones(), []);
  const filteredZones = useMemo(() => {
    const q = tzQuery.trim().toLowerCase();
    if (!q) return zones;
    return zones.filter((z) => z.toLowerCase().includes(q));
  }, [zones, tzQuery]);

  const isScheduled = new Date(value).getTime() > Date.now() + 30_000;
  const minutesAhead = Math.round((new Date(value).getTime() - Date.now()) / 60000);

  const body = (
    <div className="flex flex-col">
      {/* Status header */}
      <div
        className={cn(
          "flex items-center justify-between px-4 py-2.5 border-b border-border/60",
          isScheduled ? "bg-warning/5" : "bg-success/5",
        )}
      >
        <div className="flex items-center gap-2">
          <span className={cn("h-2 w-2 rounded-full", isScheduled ? "bg-warning" : "bg-success")} />
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            {isScheduled ? "Scheduled" : "Publishes immediately"}
          </span>
        </div>
        {isScheduled && (
          <span className="font-mono text-[10px] text-muted-foreground">
            in {minutesAhead < 60 ? `${minutesAhead}m`
              : minutesAhead < 1440 ? `${Math.round(minutesAhead / 60)}h`
              : `${Math.round(minutesAhead / 1440)}d`}
          </span>
        )}
      </div>

      {/* Preset chips — single neat row */}
      <div className="flex flex-wrap gap-1.5 px-4 py-3 border-b border-border/60">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => applyPreset(p)}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
              p.primary
                ? "border-foreground bg-foreground text-background hover:opacity-90"
                : "border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground",
            )}
          >
            {p.primary && <Zap className="h-3 w-3" />}
            {p.label}
          </button>
        ))}
      </div>

      {/* Calendar — centered */}
      <div className="flex justify-center py-1">
        <Calendar
          mode="single"
          selected={wallDateObj}
          onSelect={(d) => {
            if (!d) return;
            const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
            updateWall(iso, wall.time);
          }}
          initialFocus
          className="pointer-events-auto"
        />
      </div>

      {/* Time + Timezone */}
      <div className="space-y-2.5 border-t border-border/60 px-4 py-3">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-background/60 px-2.5 py-1.5">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <input
            type="time"
            value={wall.time}
            onChange={(e) => updateWall(wall.date, e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none [color-scheme:light] dark:[color-scheme:dark]"
          />
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {tzShort(timezone, new Date(value).getTime())}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setTzPickerOpen((v) => !v)}
          className="flex w-full items-center gap-2 rounded-lg border border-border bg-background/60 px-2.5 py-1.5 text-sm text-foreground transition-colors hover:border-foreground/30"
        >
          <Globe className="h-4 w-4 text-muted-foreground" />
          <span className="flex-1 truncate text-left">{timezone}</span>
          <ChevronRight className={cn("h-4 w-4 text-muted-foreground transition-transform", tzPickerOpen && "rotate-90")} />
        </button>

        {tzPickerOpen && (
          <div className="overflow-hidden rounded-lg border border-border bg-background">
            <div className="flex items-center gap-2 border-b border-border/60 px-2.5 py-1.5">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                value={tzQuery}
                onChange={(e) => setTzQuery(e.target.value)}
                placeholder="Search timezone…"
                className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground/60"
                autoFocus
              />
              <button
                type="button"
                onClick={() => { onTimezoneChange(localTz()); setTzQuery(""); }}
                className="rounded border border-border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
              >
                Local
              </button>
            </div>
            <ul className="max-h-44 overflow-y-auto py-1">
              {filteredZones.length === 0 && (
                <li className="px-3 py-2 text-[11px] text-muted-foreground">No matches.</li>
              )}
              {filteredZones.map((tz) => (
                <li key={tz}>
                  <button
                    type="button"
                    onClick={() => { onTimezoneChange(tz); setTzPickerOpen(false); setTzQuery(""); }}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left text-xs transition-colors hover:bg-surface-1",
                      tz === timezone && "bg-surface-1 text-foreground",
                    )}
                  >
                    <span className="truncate flex items-center gap-1.5">
                      {tz === timezone && <Check className="h-3 w-3 text-success" />}
                      {tz}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {tzShort(tz, Date.now())}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border/60 px-4 py-2.5 font-mono text-[10px] text-muted-foreground">
        <span>{format(new Date(value), "yyyy-MM-dd HH:mm")} UTC</span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md border border-border bg-background px-3 py-1 text-foreground transition-colors hover:bg-surface-1"
        >
          Done
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "group inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground transition-colors hover:border-foreground/30 focus:outline-none focus-visible:border-foreground/40",
          isScheduled && "border-warning/40 bg-warning/5",
          className,
        )}
      >
        <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground" />
        <span className="font-mono">{triggerLabel}</span>
        {isScheduled && (
          <span className="ml-1 rounded-full bg-warning/15 px-1.5 py-px font-mono text-[9px] uppercase tracking-wider text-warning">
            scheduled
          </span>
        )}
      </button>
      <BottomSheet
        open={open}
        onOpenChange={setOpen}
        title="Publish date & time"
        hideHeader
        maxWidth="380px"
      >
        {body}
      </BottomSheet>
    </>
  );
}
