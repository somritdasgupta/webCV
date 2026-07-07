/**
 * BottomSheet — responsive sheet with 3D depth on mobile:
 *   • Mobile/tablet: bottom sheet that dynamically caps at `maxHeightDvh`
 *     (default 75 % of the *visual* viewport, so it works with iOS Safari's
 *     collapsing chrome, Android nav bars, etc.). Uses vaul's
 *     `shouldScaleBackground` for a real 3D pushback, layered with an ambient
 *     drop shadow and a top highlight ring so the sheet reads as a physical
 *     surface floating above the page.
 *   • Desktop (md+): centered modal with soft scale-in.
 *
 * All close affordances are gestural — drag the handle, tap the scrim, or
 * press Esc. No corner X.
 */
import * as React from "react";
import { Drawer as Vaul } from "vaul";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  /** Force a layout regardless of viewport. */
  forceMode?: "sheet" | "modal";
  /** Max width on desktop modal. */
  maxWidth?: string;
  /** Max height of the mobile sheet as a percentage of dvh (default 75). */
  maxHeightDvh?: number;
  /** Hide the visual title header bar inside the sheet. */
  hideHeader?: boolean;
  className?: string;
  /** Content wrapper class (applied to the scroll region). */
  contentClassName?: string;
}

export function BottomSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  forceMode,
  maxWidth = "440px",
  maxHeightDvh = 75,
  hideHeader,
  className,
  contentClassName,
}: BottomSheetProps) {
  const isMobile = useIsMobile();
  const mode = forceMode ?? (isMobile ? "sheet" : "modal");

  if (mode === "modal") {
    return (
      <Vaul.Root open={open} onOpenChange={onOpenChange}>
        <Vaul.Portal>
          <Vaul.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
          <Vaul.Content
            data-vaul-no-drag
            className={cn(
              "fixed left-1/2 top-1/2 z-50 w-[min(94vw,var(--bs-mw))] -translate-x-1/2 -translate-y-1/2",
              "overflow-hidden rounded-2xl border border-border bg-popover shadow-2xl",
              "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
              className,
            )}
            style={{ ["--bs-mw" as string]: maxWidth }}
          >
            {!hideHeader && title && (
              <div className="border-b border-border/60 px-4 py-3">
                <Vaul.Title className="text-sm font-medium text-foreground">{title}</Vaul.Title>
                {description && (
                  <Vaul.Description className="mt-0.5 text-xs text-muted-foreground">
                    {description}
                  </Vaul.Description>
                )}
              </div>
            )}
            {hideHeader && (title || description) && (
              <>
                <Vaul.Title className="sr-only">{title}</Vaul.Title>
                {description && <Vaul.Description className="sr-only">{description}</Vaul.Description>}
              </>
            )}
            <div className={cn("max-h-[80vh] overflow-y-auto", contentClassName)}>{children}</div>
          </Vaul.Content>
        </Vaul.Portal>
      </Vaul.Root>
    );
  }

  // Mobile bottom sheet: dynamic height, 3D perspective, top highlight.
  const mh = Math.max(30, Math.min(95, maxHeightDvh));

  return (
    <Vaul.Root open={open} onOpenChange={onOpenChange} shouldScaleBackground>
      <Vaul.Portal>
        {/* Scrim: heavy blur + radial darkening near the sheet reads as depth. */}
        <Vaul.Overlay className="fixed inset-0 z-50 bg-black/75 backdrop-blur-[6px]" />
        <Vaul.Content
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 flex flex-col",
            "rounded-t-[28px] border-t border-border bg-popover",
            // Ambient depth: broad soft shadow + a tight upward halo.
            "shadow-[0_-30px_80px_-20px_rgba(0,0,0,0.65),0_-1px_0_0_hsl(var(--foreground)/0.06)_inset]",
            // Top rim highlight for the "lit edge" of a floating panel.
            "before:pointer-events-none before:absolute before:inset-x-6 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-foreground/25 before:to-transparent",
            className,
          )}
          style={{
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
            maxHeight: `${mh}dvh`,
            height: `${mh}dvh`,
          }}
        >
          {/* Drag handle */}
          <div className="flex shrink-0 items-center justify-center pt-2.5 pb-1.5">
            <div className="h-1.5 w-11 rounded-full bg-border/80" />
          </div>
          {!hideHeader && title && (
            <div className="shrink-0 px-5 pb-2.5 pt-1 text-center">
              <Vaul.Title className="text-sm font-medium text-foreground">{title}</Vaul.Title>
              {description && (
                <Vaul.Description className="mt-0.5 text-xs text-muted-foreground">
                  {description}
                </Vaul.Description>
              )}
            </div>
          )}
          {hideHeader && (title || description) && (
            <>
              <Vaul.Title className="sr-only">{title}</Vaul.Title>
              {description && <Vaul.Description className="sr-only">{description}</Vaul.Description>}
            </>
          )}
          <div
            className={cn(
              "min-h-0 flex-1 overflow-y-auto overscroll-contain",
              contentClassName,
            )}
          >
            {children}
          </div>
        </Vaul.Content>
      </Vaul.Portal>
    </Vaul.Root>
  );
}
