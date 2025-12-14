"use client";

import Link from "next/link";
import { useEffect, useState, useRef, useCallback } from "react";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import SocialLinks from "./SocialLinks";

const navItems = {
  "/": { name: "about" },
  "/blog": { name: "blog" },
  "/projects": { name: "projects" },
};

const desktopVariants = {
  hidden: { opacity: 0, x: 18 },
  visible: { opacity: 1, x: 0 },
};

const mobileVariants = {
  hidden: { opacity: 0, y: -30 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -24 },
};

const linkVariants = {
  hover: { scale: 1.03 },
  tap: { scale: 0.985 },
};

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const pathname = usePathname();
  const router = useRouter();
  const [activityView, setActivityView] = useState(() => {
    if (pathname === "/projects") return 0;
    if (pathname === "/activity") return 1;
    if (pathname === "/bookmarks") return 2;
    return 0;
  });

  // Sync activityView with pathname changes
  useEffect(() => {
    if (pathname === "/projects") setActivityView(0);
    else if (pathname === "/activity") setActivityView(1);
    else if (pathname === "/bookmarks") setActivityView(2);
  }, [pathname]);

  // Stable scroll handler using refs + useCallback for better performance
  const handleScroll = useCallback(() => {
    if (ticking.current) return;

    ticking.current = true;
    requestAnimationFrame(() => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setIsScrolled(currentScrollY > 20);
      lastScrollY.current = currentScrollY;
      ticking.current = false;
    });
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <>
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div
            className="fixed top-2 left-0 right-0 z-50 flex justify-center"
            variants={mobileVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            <div className="w-full px-4 md:px-8 mx-auto max-w-8xl">
              <div
                className={`nav-shimmer bg-[var(--nav-bg)]/95 backdrop-blur-md border border-[var(--nav-border)] rounded-2xl px-3 py-1 shadow-xl transition-all duration-150 overflow-hidden ${
                  isScrolled
                    ? "shadow-black/10 dark:shadow-black/40"
                    : "shadow-black/5 dark:shadow-black/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {Object.entries(navItems).map(([path, { name }]) => {
                      const isActive = pathname === path;
                      
                      // Add toggle for projects/activity/bookmarks after projects
                      if (path === "/projects") {
                        const views = ["projects", "commits", "bookmarked"];
                        const routes = ["/projects", "/activity", "/bookmarks"];
                        const isToggleActive = ['/projects', '/activity', '/bookmarks'].includes(pathname);
                        const currentIndex = pathname === "/projects" ? 0 : pathname === "/activity" ? 1 : pathname === "/bookmarks" ? 2 : 0;
                        
                        const handleToggle = () => {
                          const nextIndex = (currentIndex + 1) % 3;
                          router.push(routes[nextIndex]);
                        };
                        
                        return (
                          <motion.button
                            key="toggle"
                            onClick={handleToggle}
                            className="flex items-center gap-2 px-2 py-0.5 cursor-pointer hover:opacity-80 transition-all duration-200"
                          >
                            <motion.span 
                              key={views[currentIndex]}
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2, ease: "easeOut" }}
                              className={`font-extrabold text-xs lowercase ${
                                isToggleActive ? 'text-[var(--nav-text-active)]' : 'text-[var(--nav-text)]'
                              }`}
                            >
                              {views[currentIndex]}
                            </motion.span>
                            <div className="flex gap-1">
                              {[0, 1, 2].map((i) => {
                                const colors = ['bg-red-500', 'bg-blue-500', 'bg-yellow-500'];
                                return (
                                  <motion.div
                                    key={i}
                                    animate={{
                                      scale: i === currentIndex ? 1.25 : 1
                                    }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      i === currentIndex ? colors[i] : "bg-[var(--nav-text)]/30"
                                    }`}
                                  />
                                );
                              })}
                            </div>
                          </motion.button>
                        );
                      }
                      
                      if (path === "/projects") return null;
                      
                      return (
                        <motion.div
                          key={path}
                          variants={linkVariants}
                          whileHover="hover"
                          whileTap="tap"
                          transition={{ duration: 0.12, ease: "easeOut" }}
                        >
                          <Link
                            href={path}
                            aria-current={isActive ? "page" : undefined}
                            className={`flex items-center justify-center px-2 py-0.5 rounded-md transition-all duration-150 relative ${
                              isActive
                                ? "text-[var(--nav-text-active)] font-extrabold text-sm scale-[1.02]"
                                : "text-[var(--nav-text)] hover:text-[var(--nav-text-hover)]"
                            }`}
                          >
                            <span className="relative z-10 lowercase text-xs">
                              {name}
                            </span>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>

                  <div className="flex items-center space-x-2">
                    <a
                      href="/Resume.pdf"
                      className="hidden sm:inline-flex items-center justify-center h-6 px-2 text-[var(--nav-text)]/75 hover:text-[var(--nav-text-active)] transition-colors duration-150 rounded-md text-xs"
                    >
                      resume
                    </a>
                    <div className="ml-2">
                      <ThemeSwitcher compact />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={
          pathname === "/" ? "h-8 md:h-10 lg:h-8" : "h-12 md:h-16 lg:h-12"
        }
      />
    </>
  );
}