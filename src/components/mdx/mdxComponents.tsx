import React, { ComponentPropsWithoutRef, ReactNode } from "react";
import { Callout } from "./Callout";
import { ProsCons, Quote, Kbd } from "./ProsCons";
import { LiveCode } from "./LiveCode";
import { TweetCard } from "./TweetCard";
import { Chart } from "./Chart";
import { Stats, Stat } from "./Stats";
import { Tabs, Tab } from "./Tabs";
import { Steps, Step } from "./Steps";
import { Accordion, AccordionItem } from "./Accordion";
import { Video } from "./Video";
import { Badge } from "./Badge";
import { FileTree } from "./FileTree";

/**
 * Map of components available in any MDX file without imports.
 * Pass to <MDXProvider components={mdxComponents}>.
 */
export const mdxComponents = {
  // Content components
  Callout,
  ProsCons,
  Quote,
  Kbd,
  LiveCode,
  Tweet: TweetCard,
  // Data + interactive
  Chart,
  Stats,
  Stat,
  Tabs,
  Tab,
  Steps,
  Step,
  Accordion,
  AccordionItem,
  Video,
  Badge,
  FileTree,

  // Tighter default rendering
  a: (props: ComponentPropsWithoutRef<"a">) => {
    const isExternal = props.href?.startsWith("http");
    return (
      <a
        {...props}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noreferrer noopener" : undefined}
      />
    );
  },
  img: (props: ComponentPropsWithoutRef<"img">) => (
    <figure className="my-6">
      <img loading="lazy" {...props} />
      {props.alt && (
        <figcaption className="mt-2 text-center text-xs text-muted-foreground">
          {props.alt}
        </figcaption>
      )}
    </figure>
  ),
  table: (props: ComponentPropsWithoutRef<"table">) => (
    <div className="not-prose my-8 overflow-x-auto rounded-xl border border-border bg-card/30 shadow-sm">
      <table className="w-full border-collapse text-left text-sm" {...props} />
    </div>
  ),
  thead: (props: ComponentPropsWithoutRef<"thead">) => (
    <thead className="bg-surface-1/60" {...props} />
  ),
  tr: (props: ComponentPropsWithoutRef<"tr">) => (
    <tr className="border-b border-border/60 transition-colors last:border-0 hover:bg-surface-1/40" {...props} />
  ),
  th: (props: ComponentPropsWithoutRef<"th">) => (
    <th
      className="border-b border-border px-4 py-3 text-left font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground"
      {...props}
    />
  ),
  td: (props: ComponentPropsWithoutRef<"td">) => (
    <td className="px-4 py-3 align-top text-foreground/90 [&_code]:rounded [&_code]:bg-surface-2 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.85em]" {...props} />
  ),
  hr: () => <hr className="my-12 border-t border-border" />,
} as unknown as Record<string, React.ComponentType<Record<string, unknown> & { children?: ReactNode }>>;
