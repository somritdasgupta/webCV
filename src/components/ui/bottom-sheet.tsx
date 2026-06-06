/**
 * BottomSheet — consistent, responsive sheet:
 *   • Mobile/tablet: bottom sheet with 3D depth backdrop, drag handle, no X.
 *     Height is capped at 70dvh so it never overflows on browsers with
 *     dynamic toolbars (Safari address bar, iOS Liquid Glass, etc.).
 *   • Desktop (md+): centered modal with soft scale-in.
 *
 * Built on vaul (already used by ui/drawer.tsx). All close affordances are
 * gestural — drag the handle, tap the scrim, or press Esc. No corner X.
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
  /** Hide the visual title header bar inside the sheet. */
  hideHeader?: boolean;
  className?: string;
}

export function BottomSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  forceMode,
  maxWidth = "440px",
  hideHeader,
  className,
}: BottomSheetProps) {
  const isMobile = useIsMobile();
  const mode = forceMode ?? (isMobile ? "sheet" : "modal");

  if (mode === "modal") {
    // Centered modal
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
            <div className="max-h-[80vh] overflow-y-auto">{children}</div>
          </Vaul.Content>
        </Vaul.Portal>
      </Vaul.Root>
    );
  }

  // Mobile bottom sheet with 3D backdrop scale
  return (
    <Vaul.Root open={open} onOpenChange={onOpenChange} shouldScaleBackground>
      <Vaul.Portal>
        <Vaul.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-[3px]" />
        <Vaul.Content
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 flex flex-col",
            "rounded-t-[22px] border-t border-border bg-popover shadow-[0_-24px_60px_-12px_rgba(0,0,0,0.45)]",
            // 70% of available viewport, accounts for dynamic toolbars
            "max-h-[70dvh]",
            className,
          )}
          style={{
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
          }}
        >
          {/* Drag handle */}
          <div className="flex shrink-0 items-center justify-center pt-2.5 pb-1">
            <div className="h-1.5 w-10 rounded-full bg-border" />
          </div>
          {!hideHeader && title && (
            <div className="shrink-0 px-4 pb-2 pt-1 text-center">
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
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
        </Vaul.Content>
      </Vaul.Portal>
    </Vaul.Root>
  );
}
