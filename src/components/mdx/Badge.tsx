import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps {
  children: ReactNode;
  /** default | success | warn | danger | info */
  tone?: "default" | "success" | "warn" | "danger" | "info";
}

export const Badge = ({ children, tone = "default" }: BadgeProps) => (
  <span
    className={cn(
      "mx-0.5 inline-flex items-center rounded-md border px-1.5 py-0.5 align-middle text-[11px] font-medium",
      tone === "default" && "border-border bg-muted text-muted-foreground",
      tone === "success" && "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
      tone === "warn" && "border-amber-500/30 bg-amber-500/10 text-amber-500",
      tone === "danger" && "border-rose-500/30 bg-rose-500/10 text-rose-500",
      tone === "info" && "border-sky-500/30 bg-sky-500/10 text-sky-500",
    )}
  >
    {children}
  </span>
);
