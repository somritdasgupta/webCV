/**
 * ComponentsPicker — responsive sheet/modal that lists MDX snippets the
 * editor can insert. Bottom sheet on mobile, centered modal on desktop.
 */
import { useMemo, useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { cn } from "@/lib/utils";

export interface ComponentSnippet {
  label: string;
  hint: string;
  snippet: string;
}

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  snippets: ComponentSnippet[];
  onInsert: (snippet: string) => void;
}

export function ComponentsPicker({ open, onOpenChange, snippets, onInsert }: Props) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return snippets;
    return snippets.filter(
      (s) => s.label.toLowerCase().includes(needle) || s.hint.toLowerCase().includes(needle),
    );
  }, [q, snippets]);

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} maxWidth="560px" hideHeader title="Insert component">
      <div className="flex flex-col">
        <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
          <Sparkles className="h-4 w-4 text-accent" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Insert component
          </span>
          <span className="ml-auto text-[10px] text-muted-foreground/70">
            {filtered.length}/{snippets.length}
          </span>
        </div>
        <div className="border-b border-border/60 px-3 py-2">
          <div className="flex items-center gap-2 rounded-md border border-border bg-background px-2.5 py-1.5">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search components…"
              autoFocus
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-1 p-2 sm:grid-cols-2">
          {filtered.length === 0 && (
            <div className="col-span-full px-3 py-8 text-center text-xs text-muted-foreground">
              No components match "{q}"
            </div>
          )}
          {filtered.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                onInsert(item.snippet);
                onOpenChange(false);
              }}
              className={cn(
                "group flex flex-col gap-0.5 rounded-md border border-transparent px-3 py-2 text-left transition-colors",
                "hover:border-border hover:bg-surface-1 active:scale-[0.99]",
              )}
            >
              <span className="text-[13px] font-medium text-foreground">{item.label}</span>
              <span className="truncate text-[11px] text-muted-foreground">{item.hint}</span>
            </button>
          ))}
        </div>
      </div>
    </BottomSheet>
  );
}
