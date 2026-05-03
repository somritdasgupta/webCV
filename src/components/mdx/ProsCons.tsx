import { ReactNode } from "react";
import { Check, X } from "lucide-react";

interface ItemListProps {
  items: string[];
  variant: "pro" | "con";
}

const ItemList = ({ items, variant }: ItemListProps) => {
  const Icon = variant === "pro" ? Check : X;
  const color = variant === "pro" ? "text-success" : "text-destructive";
  const heading = variant === "pro" ? "Pro's" : "Con's";
  return (
    <div className="rounded-lg border border-border bg-surface-1 p-5">
      <h4 className="mb-3 flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <span className={color}>●</span> {heading}
      </h4>
      <ul className="space-y-2">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2 text-[0.95em] leading-relaxed">
            <Icon className={`mt-1 h-3.5 w-3.5 shrink-0 ${color}`} />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const ProsCons = ({ pros, cons }: { pros: string[]; cons: string[] }) => (
  <div className="my-6 grid gap-4 sm:grid-cols-2">
    <ItemList items={pros} variant="pro" />
    <ItemList items={cons} variant="con" />
  </div>
);

export const Quote = ({ author, children }: { author?: string; children: ReactNode }) => (
  <figure className="my-8">
    <blockquote className="border-l-2 border-accent pl-5 font-serif text-2xl leading-snug text-foreground">
      "{children}"
    </blockquote>
    {author && <figcaption className="mt-2 text-sm text-muted-foreground">— {author}</figcaption>}
  </figure>
);

export const Kbd = ({ children }: { children: ReactNode }) => (
  <kbd className="inline-flex items-center rounded border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-xs">
    {children}
  </kbd>
);
