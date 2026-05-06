import { NavLink } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { NAV } from "@/site.config";
import { cn } from "@/lib/utils";

/**
 * Floating pill nav, centered, with mac traffic-light dots on the active item.
 * Left cluster: page links · Right cluster: CV, theme.
 */
export const SiteNav = () => {

  return (
    <header
      className="pointer-events-none fixed inset-x-0 z-50 flex justify-center px-2 sm:px-3"
      style={{ top: "calc(env(safe-area-inset-top, 0px) + 0.75rem)" }}
    >
      <div
        className={cn(
          "pointer-events-auto flex max-w-[calc(100vw-1rem)] items-center gap-0.5 rounded-full border border-border/70 sm:gap-1",
          "bg-background/70 px-1.5 py-1 shadow-elev-md backdrop-blur-xl sm:px-2 sm:py-1.5",
          "supports-[backdrop-filter]:bg-background/55",
          "transition-all duration-500 ease-out-expo",
        )}
      >
        {/* Left: page links */}
        <nav className="flex items-center">
          {NAV.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === "/"}
              className={({ isActive }) =>
                cn(
                  "group relative inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[13px] font-medium transition-colors duration-300 sm:gap-1.5 sm:px-3 sm:text-sm",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span className="lowercase">{item.label}</span>
                  {/* mac traffic-light dots, only when active */}
                  <span
                    className={cn(
                      "ml-0.5 inline-flex items-center gap-0.5 transition-all duration-500 ease-out-expo",
                      isActive
                        ? "max-w-[24px] opacity-100"
                        : "max-w-0 opacity-0 overflow-hidden",
                    )}
                    aria-hidden
                  >
                    <span className="h-1 w-1 rounded-full bg-[#ff5f57] sm:h-1.5 sm:w-1.5" />
                    <span className="h-1 w-1 rounded-full bg-[#febc2e] sm:h-1.5 sm:w-1.5" />
                    <span className="h-1 w-1 rounded-full bg-[#28c840] sm:h-1.5 sm:w-1.5" />
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* divider */}
        <span className="mx-0.5 h-4 w-px bg-border/70 sm:mx-1 sm:h-5" aria-hidden />

        {/* Right: actions */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          <NavLink
            to="/cv"
            className={({ isActive }) =>
              cn(
                "inline-flex items-center rounded-full px-2.5 py-1.5 text-[13px] font-medium transition-all duration-300 hover:bg-secondary hover:text-foreground sm:px-3 sm:text-sm",
                isActive ? "text-foreground" : "text-muted-foreground",
              )
            }
          >
            cv
          </NavLink>
          <div className="ml-0.5">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};
