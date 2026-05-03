import { Children, isValidElement, ReactElement, ReactNode, useState } from "react";
import { cn } from "@/lib/utils";

export interface TabProps {
  label: string;
  children: ReactNode;
}

export const Tab = ({ children }: TabProps) => <>{children}</>;

export interface TabsProps {
  /** Pass <Tab label="..."> children */
  children: ReactNode;
  defaultIndex?: number;
}

export const Tabs = ({ children, defaultIndex = 0 }: TabsProps) => {
  const tabs = Children.toArray(children).filter(isValidElement) as ReactElement<TabProps>[];
  const [active, setActive] = useState(Math.min(defaultIndex, Math.max(0, tabs.length - 1)));

  if (tabs.length === 0) return null;

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-border bg-card/40">
      <div role="tablist" className="flex gap-1 border-b border-border bg-surface-1/40 p-1">
        {tabs.map((t, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={active === i}
            onClick={() => setActive(i)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm transition-colors",
              active === i
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.props.label}
          </button>
        ))}
      </div>
      <div className="p-4 sm:p-5">{tabs[active]}</div>
    </div>
  );
};
