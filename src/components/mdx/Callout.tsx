import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Info, AlertTriangle, CheckCircle2, Lightbulb, AlertOctagon } from "lucide-react";

type CalloutType = "note" | "tip" | "warning" | "danger" | "success";

const config: Record<CalloutType, { icon: typeof Info; cls: string }> = {
  note:    { icon: Info,          cls: "border-foreground/20 bg-surface-1 text-foreground" },
  tip:     { icon: Lightbulb,     cls: "border-accent/40 bg-accent/10 text-foreground" },
  warning: { icon: AlertTriangle, cls: "border-warning/40 bg-warning/10 text-foreground" },
  danger:  { icon: AlertOctagon,  cls: "border-destructive/40 bg-destructive/10 text-foreground" },
  success: { icon: CheckCircle2,  cls: "border-success/40 bg-success/10 text-foreground" },
};

export const Callout = ({
  type = "note",
  title,
  emoji,
  children,
}: {
  type?: CalloutType;
  title?: string;
  emoji?: string;
  children: ReactNode;
}) => {
  const { icon: Icon, cls } = config[type];
  return (
    <aside className={cn("my-6 flex gap-3 rounded-lg border px-4 py-3 text-[0.95em]", cls)}>
      <div className="mt-0.5 shrink-0">
        {emoji ? <span className="text-lg leading-none">{emoji}</span> : <Icon className="h-4 w-4" />}
      </div>
      <div className="min-w-0 flex-1">
        {title && <div className="mb-1 font-semibold">{title}</div>}
        <div className="prose-callout [&>p]:m-0 [&>p+p]:mt-2">{children}</div>
      </div>
    </aside>
  );
};
