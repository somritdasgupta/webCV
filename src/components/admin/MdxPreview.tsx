import { useEffect, useState } from "react";
import * as runtime from "react/jsx-runtime";
import { evaluate } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import { mdxComponents } from "@/components/mdx/mdxComponents";
import { parseFrontmatter } from "@/lib/admin/frontmatter";
import { Loader2, AlertTriangle } from "lucide-react";

/**
 * Live MDX preview — compiles the body in the browser and renders it with
 * the same components used by the published site. This means <Callout>,
 * <ProsCons>, <Tweet>, etc. show up exactly as they will after publish.
 */
export const MdxPreview = ({ source }: { source: string }) => {
  const [Content, setContent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [compiling, setCompiling] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // Strip frontmatter — MDX would choke on it
    const { body } = parseFrontmatter(source || "");
    if (!body.trim()) {
      setContent(null);
      setError(null);
      return;
    }
    setCompiling(true);
    const handle = window.setTimeout(async () => {
      try {
        const mod = await evaluate(body, {
          ...(runtime as Record<string, unknown>),
          remarkPlugins: [remarkGfm],
          development: false,
        } as Parameters<typeof evaluate>[1]);
        if (cancelled) return;
        setContent(() => mod.default as React.ComponentType);
        setError(null);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : String(e));
        setContent(null);
      } finally {
        if (!cancelled) setCompiling(false);
      }
    }, 250); // debounce while typing
    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [source]);

  if (error) {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <pre className="whitespace-pre-wrap break-words font-mono text-xs">{error}</pre>
      </div>
    );
  }

  if (!Content) {
    return (
      <p className="text-sm text-muted-foreground">
        {compiling ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Compiling preview…
          </span>
        ) : (
          "Preview appears here."
        )}
      </p>
    );
  }

  return (
    <div className="relative">
      {compiling && (
        <div className="absolute right-0 top-0 inline-flex items-center gap-1.5 rounded-full border border-border bg-card/80 px-2 py-0.5 text-[11px] text-muted-foreground backdrop-blur-md">
          <Loader2 className="h-3 w-3 animate-spin" /> compiling
        </div>
      )}
      <Content {...({ components: mdxComponents } as Record<string, unknown>)} />
    </div>
  );
};