import { Children, isValidElement, ReactElement, ReactNode, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AccordionItemProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export const AccordionItem = ({ title, children, defaultOpen = false }: AccordionItemProps) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 py-3 text-left text-sm font-medium hover:text-foreground"
        aria-expanded={open}
      >
        <span>{title}</span>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")}
        />
      </button>
      <div
        className={cn(
          "grid overflow-hidden text-sm text-muted-foreground transition-[grid-template-rows] duration-300",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="min-h-0">
          <div className="pb-4 [&>p]:my-2">{children}</div>
        </div>
      </div>
    </div>
  );
};

export const Accordion = ({ children }: { children: ReactNode }) => {
  const items = Children.toArray(children).filter(isValidElement) as ReactElement[];
  return (
    <div className="my-6 rounded-xl border border-border bg-card/40 px-4">
      {items}
    </div>
  );
};
