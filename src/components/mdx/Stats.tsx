import { ReactNode } from "react";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatProps {
  label: string;
  value: ReactNode;
  /** Optional small note under the value */
  hint?: string;
  /** Percent change e.g. 12.4 or -3.1 */
  change?: number;
  /** Suffix appended to change number, default "%" */
  changeSuffix?: string;
}

const Stat = ({ label, value, hint, change, changeSuffix = "%" }: StatProps) => {
  const dir = change == null ? "flat" : change > 0 ? "up" : change < 0 ? "down" : "flat";
  const Icon = dir === "up" ? TrendingUp : dir === "down" ? TrendingDown : Minus;
  return (
    <div className="min-w-0 flex-1 basis-[140px] rounded-xl border border-border bg-card/40 p-3 sm:basis-auto sm:p-4">
      <div className="truncate text-[10px] uppercase tracking-wide text-muted-foreground sm:text-xs">{label}</div>
      <div className="mt-1 flex items-baseline gap-1.5 sm:gap-2">
        <div className="font-serif text-2xl tracking-tight sm:text-3xl">{value}</div>
        {change != null && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium sm:text-[11px]",
              dir === "up" && "bg-emerald-500/10 text-emerald-500",
              dir === "down" && "bg-rose-500/10 text-rose-500",
              dir === "flat" && "bg-muted text-muted-foreground",
            )}
          >
            <Icon className="h-3 w-3" />
            {Math.abs(change)}
            {changeSuffix}
          </span>
        )}
      </div>
      {hint && <div className="mt-1 truncate text-[10px] text-muted-foreground sm:text-xs">{hint}</div>}
    </div>
  );
};

export interface StatsProps {
  /** Pass <Stat ... /> children OR an `items` array */
  children?: ReactNode;
  items?: StatProps[];
  cols?: 2 | 3 | 4;
}

export const Stats = ({ children, items, cols = 3 }: StatsProps) => {
  // Mobile: flex-wrap so chips fit on one row when small, stack when long.
  // Desktop (sm+): proper grid with the requested column count.
  const cls = cn(
    "my-6 flex flex-wrap gap-2 sm:grid sm:gap-3",
    cols === 2 && "sm:grid-cols-2",
    cols === 3 && "sm:grid-cols-3",
    cols === 4 && "sm:grid-cols-2 md:grid-cols-4",
  );
  if (items) {
    return (
      <div className={cls}>
        {items.map((it, i) => (
          <Stat key={i} {...it} />
        ))}
      </div>
    );
  }
  return <div className={cls}>{children}</div>;
};

Stats.Stat = Stat;
export { Stat };
