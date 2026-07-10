/**
 * ComponentsPicker — responsive picker with a sticky header (title + search).
 * The list scrolls independently below the fixed search bar so the input never
 * disappears. Bottom sheet on mobile, centered modal on desktop.
 */
import { useMemo, useState } from "react";
import { Search, Sparkles, X } from "lucide-react";
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
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      maxWidth="760px"
      maxHeightDvh={88}
      hideHeader
      title="Insert component"
      contentClassName="!overflow-hidden flex flex-col"
    >
      <div className="flex h-full min-h-0 flex-col">
        {/* Sticky header: title + search — never scrolls away */}
        <div className="sticky top-0 z-10 shrink-0 border-b border-border/60 bg-popover/95 backdrop-blur supports-[backdrop-filter]:bg-popover/80">
          <div className="flex items-center gap-2 px-5 pb-2 pt-4">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Insert component
            </span>
            <span className="ml-auto font-mono text-[10px] text-muted-foreground/70">
              {filtered.length}/{snippets.length}
            </span>
          </div>
          <div className="px-4 pb-4">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2.5 focus-within:border-foreground/40">
              <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search components…"
                autoFocus
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
              />
              {q && (
                <button
                  type="button"
                  onClick={() => setQ("")}
                  aria-label="Clear search"
                  className="rounded p-0.5 text-muted-foreground transition-colors hover:bg-surface-1 hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable results */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {filtered.length === 0 && (
            <div className="px-4 py-10 text-center text-xs text-muted-foreground">
              No components match "{q}"
            </div>
          )}
          <div className="grid grid-cols-1 gap-2 p-3 md:grid-cols-2">
            {filtered.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  onInsert(item.snippet);
                  onOpenChange(false);
                }}
                className={cn(
                  "group flex min-h-16 flex-col justify-center gap-1 rounded-lg border border-border bg-background px-4 py-3 text-left transition-all",
                  "hover:bg-surface-1 active:scale-[0.99]",
                )}
              >
                <span className="text-sm font-medium text-foreground">{item.label}</span>
                <span className="truncate text-[11px] text-muted-foreground">{item.hint}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}
