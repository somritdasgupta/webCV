import { ReactNode } from "react";
import { SiteNav } from "./SiteNav";
import { useLocation } from "react-router-dom";

export const SiteLayout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  return (
    <>
      {/* Ambient site-wide smoke — sits behind all content */}
      <div className="ambient-smoke" aria-hidden>
        <span />
      </div>
      <a
        href="#content"
        className="fixed left-3 top-3 z-[60] -translate-y-16 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground shadow-elev-md transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>
      <div className="flex min-h-screen flex-col">
        <SiteNav />
        {/* pt offset to clear the floating pill */}
        <main id="content" key={location.pathname} className="flex-1 page-enter pt-16 sm:pt-20">
          {children}
        </main>
      </div>
    </>
  );
};
