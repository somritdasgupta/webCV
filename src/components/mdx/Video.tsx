import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface VideoProps {
  /** YouTube ID, Vimeo ID, or direct mp4 URL */
  src: string;
  /** youtube | vimeo | mp4. Auto-detected from src if not given. */
  provider?: "youtube" | "vimeo" | "mp4";
  caption?: string;
  /** width / height ratio, default 16/9 */
  ratio?: number;
}

const detect = (src: string): "youtube" | "vimeo" | "mp4" => {
  if (/youtube\.com|youtu\.be/.test(src)) return "youtube";
  if (/vimeo\.com/.test(src)) return "vimeo";
  return "mp4";
};

const ytId = (src: string) => {
  const m =
    src.match(/[?&]v=([^&]+)/) ||
    src.match(/youtu\.be\/([^?&]+)/) ||
    src.match(/embed\/([^?&]+)/);
  return m ? m[1] : src;
};

const vimeoId = (src: string) => {
  const m = src.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? m[1] : src;
};

export const Video = ({ src, provider, caption, ratio = 16 / 9 }: VideoProps) => {
  const p = provider ?? detect(src);
  const padding = `${(1 / ratio) * 100}%`;

  let inner: ReactNode;
  if (p === "youtube") {
    inner = (
      <iframe
        src={`https://www.youtube.com/embed/${ytId(src)}`}
        title="YouTube video"
        loading="lazy"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
      />
    );
  } else if (p === "vimeo") {
    inner = (
      <iframe
        src={`https://player.vimeo.com/video/${vimeoId(src)}`}
        title="Vimeo video"
        loading="lazy"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
      />
    );
  } else {
    inner = (
      <video
        src={src}
        controls
        playsInline
        className="absolute inset-0 h-full w-full bg-black"
      />
    );
  }

  return (
    <figure className="my-8">
      <div
        className={cn("relative w-full overflow-hidden rounded-xl border border-border bg-black")}
        style={{ paddingTop: padding }}
      >
        {inner}
      </div>
      {caption && (
        <figcaption className="mt-2 text-center text-xs text-muted-foreground">{caption}</figcaption>
      )}
    </figure>
  );
};
