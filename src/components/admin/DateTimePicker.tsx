/**
 * Compact date + time + timezone picker for the editor.
 *
 * Value contract:
 *   - `value` is an ISO 8601 UTC string ("...Z").
 *   - `timezone` is an IANA TZ name (e.g. "Asia/Kolkata").
 *   - The popover shows wall-clock date/time *in that timezone* but the
 *     stored value is always UTC, so frontmatter stays unambiguous.
 *
 * "Now" sets the value to the current instant in the selected timezone,
 * which clears any scheduled state because the date is not in the future.
 */
import { useMemo, useState } from "react";
import { Calendar as CalendarIcon, Clock, Globe, Zap } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ── TZ helpers ───────────────────────────────────────────────── */

/** Offset (in minutes) of an IANA tz at the given UTC instant. */
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

/** UTC ISO → { y,m,d,hh,mm } as wall-clock in tz. */
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

/** Wall date/time in tz → UTC ISO. Iterates once for DST edge correctness. */
function wallToUtcIso(date: string, time: string, tz: string): string {
  const guess = new Date(`${date}T${time}:00Z`).getTime();
  let offset = tzOffsetMin(tz, guess);
  let utc = guess - offset * 60000;
  // re-check at the corrected instant in case we crossed a DST boundary
  const offset2 = tzOffsetMin(tz, utc);
  if (offset2 !== offset) utc = guess - offset2 * 60000;
  return new Date(utc).toISOString();
}

/** Pretty short tz tag like "IST" or "GMT+5:30". */
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

/** Browser local tz, falling back to UTC. */
export const localTz = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
};

/** All IANA zones — uses Intl.supportedValuesOf when available. */
const TZ_FALLBACK = [
  "UTC",
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Africa/Cairo",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Pacific/Auckland",
];

const allZones = (): string[] => {
  type IntlExt = { supportedValuesOf?: (k: string) => string[] };
  const fn = (Intl as unknown as IntlExt).supportedValuesOf;
  if (typeof fn === "function") {
    try {
      return fn("timeZone");
    } catch {
      /* fall through */
    }
  }
  return TZ_FALLBACK;
};

/* ── Component ────────────────────────────────────────────────── */

export interface DateTimePickerProps {
  /** UTC ISO string. */
  value: string;
  onChange: (isoUtc: string) => void;
  timezone: string;
  onTimezoneChange: (tz: string) => void;
  className?: string;
}

export function DateTimePicker({
  value,
  onChange,
  timezone,
  onTimezoneChange,
  className,
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const wall = useMemo(() => utcToWall(value, timezone), [value, timezone]);

  // Calendar Date object representing the *wall* date (so the highlighted
  // day matches what the user sees regardless of their browser tz).
  const wallDateObj = useMemo(() => {
    const [y, m, d] = wall.date.split("-").map(Number);
    return new Date(y, m - 1, d);
  }, [wall.date]);

  const updateWall = (date: string, time: string) => {
    onChange(wallToUtcIso(date, time, timezone));
  };

  const setNow = () => {
    const now = new Date();
    onChange(now.toISOString());
  };

  const triggerLabel = useMemo(() => {
    const d = new Date(value);
    const fmt = new Intl.DateTimeFormat(undefined, {
      timeZone: timezone,
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${fmt.format(d)} · ${tzShort(timezone, d.getTime())}`;
  }, [value, timezone]);

  const zones = useMemo(() => allZones(), []);
  const isScheduled = new Date(value).getTime() > Date.now() + 30_000;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
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
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-auto p-0 pointer-events-auto"
      >
        <div className="flex flex-col">
          <Calendar
            mode="single"
            selected={wallDateObj}
            onSelect={(d) => {
              if (!d) return;
              const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
              updateWall(iso, wall.time);
            }}
            initialFocus
            className="p-3 pointer-events-auto"
          />
          <div className="space-y-2.5 border-t border-border/60 p-3">
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="time"
                value={wall.time}
                onChange={(e) => updateWall(wall.date, e.target.value)}
                className="flex-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs outline-none focus:border-foreground/40 [color-scheme:dark] dark:[color-scheme:dark]"
              />
              <button
                type="button"
                onClick={setNow}
                title="Set to right now — publishes immediately"
                className="inline-flex items-center gap-1 rounded-md border border-border bg-foreground px-2.5 py-1.5 text-[11px] font-medium text-background transition-opacity hover:opacity-90"
              >
                <Zap className="h-3 w-3" />
                Now
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-3.5 w-3.5 text-muted-foreground" />
              <Select value={timezone} onValueChange={onTimezoneChange}>
                <SelectTrigger className="h-8 flex-1 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {zones.map((tz) => (
                    <SelectItem key={tz} value={tz} className="text-xs">
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between pt-1 font-mono text-[10px] text-muted-foreground">
              <span>{format(new Date(value), "yyyy-MM-dd HH:mm")} UTC</span>
              {isScheduled ? (
                <span className="text-warning">scheduled</span>
              ) : (
                <span className="text-success">publishes now</span>
              )}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
