import { useMemo } from "react";
import { cn } from "@/lib/utils";

export interface EmbedProps {
  /** Any embeddable URL: CodePen, CodeSandbox, Figma, Spotify, Maps, a dashboard, etc. */
  src?: string;
  /** Raw HTML snippet rendered inside a sandboxed iframe (use instead of `src`). */
  html?: string;
  title?: string;
  caption?: string;
  /** width / height ratio. Default 16/9. Ignored when `height` is set. */
  ratio?: number;
  /** Fixed pixel height. Overrides `ratio`. */
  height?: number;
  /** Allow the frame to run scripts/forms. Default true. */
  interactive?: boolean;
  className?: string;
}

const SANDBOX_INTERACTIVE =
  "allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms allow-presentation";
const SANDBOX_STATIC = "allow-popups allow-popups-to-escape-sandbox";

/** Normalize common "page" URLs into their embeddable equivalents. */
const toEmbedUrl = (raw: string): string => {
  try {
    const u = new URL(raw);
    const host = u.hostname.replace(/^www\./, "");

    if (host === "youtube.com" && u.searchParams.get("v"))
      return `https://www.youtube.com/embed/${u.searchParams.get("v")}`;
    if (host === "youtu.be") return `https://www.youtube.com/embed${u.pathname}`;
    if (host === "vimeo.com" && /^\/\d+$/.test(u.pathname))
      return `https://player.vimeo.com/video${u.pathname}`;
    if (host === "codepen.io") return raw.replace("/pen/", "/embed/");
    if (host === "codesandbox.io" && u.pathname.startsWith("/s/"))
      return raw.replace("/s/", "/embed/");
    if (host === "github.com" && u.pathname.includes("/blob/")) return raw;
    if (host === "figma.com" || host === "figma.com".replace("figma", "figma"))
      return `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(raw)}`;
    if (host === "open.spotify.com" && !u.pathname.startsWith("/embed"))
      return `https://open.spotify.com/embed${u.pathname}`;
    return raw;
  } catch {
    return raw;
  }
};

/**
 * Generic third-party embed for MDX.
 *
 * <Embed src="https://codepen.io/team/codepen/pen/PNaGbb" height={420} />
 * <Embed html="<b>hi</b>" height={120} />
 */
export const Embed = ({
  src,
  html,
  title = "Embedded content",
  caption,
  ratio = 16 / 9,
  height,
  interactive = true,
  className,
}: EmbedProps) => {
  const url = useMemo(() => (src ? toEmbedUrl(src) : undefined), [src]);

  if (!url && !html) return null;

  const sandbox = interactive ? SANDBOX_INTERACTIVE : SANDBOX_STATIC;
  const frameProps = {
    title,
    loading: "lazy" as const,
    referrerPolicy: "no-referrer-when-downgrade" as const,
    allow:
      "accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture",
    allowFullScreen: true,
    className: "absolute inset-0 h-full w-full border-0 bg-background",
  };

  return (
    <figure className={cn("not-prose my-8", className)}>
      <div
        className="relative w-full overflow-hidden rounded-xl border border-border bg-surface-1/40 shadow-elev-sm"
        style={height ? { height } : { paddingTop: `${(1 / ratio) * 100}%` }}
      >
        {url ? (
          <iframe {...frameProps} src={url} sandbox={sandbox} />
        ) : (
          // Raw HTML runs isolated: no same-origin access to this site.
          <iframe {...frameProps} srcDoc={html} sandbox="allow-scripts allow-popups" />
        )}
      </div>
      {caption && (
        <figcaption className="mt-2 text-center text-xs text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
};
