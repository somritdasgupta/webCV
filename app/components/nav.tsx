"use client";

import Link from "next/link";
import { useEffect, useState, useRef, useCallback } from "react";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import SocialLinks from "./SocialLinks";
import { ChatInterface } from "./ChatInterface";

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
  const [showChat, setShowChat] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const pathname = usePathname();
  const router = useRouter();

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
                className={`nav-shimmer bg-(--nav-bg)/95 backdrop-blur-md rounded-2xl px-3 py-1 shadow-xl transition-all duration-150 overflow-hidden ${
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
                        const isToggleActive = [
                          "/projects",
                          "/activity",
                          "/bookmarks",
                        ].includes(pathname);
                        const currentIndex =
                          pathname === "/activity"
                            ? 1
                            : pathname === "/bookmarks"
                              ? 2
                              : 0;

                        const handleToggle = () => {
                          // If not on any of the toggle pages, go to projects first
                          if (!isToggleActive) {
                            router.push(routes[0]);
                            return;
                          }
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
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.2, ease: "easeOut" }}
                              className={`font-extrabold text-xs lowercase ${
                                isToggleActive
                                  ? "text-(--nav-text-active)"
                                  : "text-(--nav-text)"
                              }`}
                            >
                              {views[currentIndex]}
                            </motion.span>
                            <div className="flex gap-1">
                              {[0, 1, 2].map((i) => {
                                const activeColors = [
                                  "bg-red-500",
                                  "bg-blue-500",
                                  "bg-yellow-500",
                                ];
                                const inactiveColors = [
                                  "bg-red-500/40",
                                  "bg-blue-500/40",
                                  "bg-yellow-500/40",
                                ];
                                return (
                                  <motion.div
                                    key={i}
                                    animate={{
                                      scale: i === currentIndex ? 1.25 : 1,
                                    }}
                                    transition={{
                                      duration: 0.3,
                                      ease: "easeOut",
                                    }}
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      i === currentIndex
                                        ? activeColors[i]
                                        : inactiveColors[i]
                                    }`}
                                  />
                                );
                              })}
                            </div>
                          </motion.button>
                        );
                      }

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
                                ? "text-(--nav-text-active) font-extrabold text-sm scale-[1.02]"
                                : "text-(--nav-text) hover:text-(--nav-text-hover)"
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
                    <button
                      onClick={() => setShowChat(true)}
                      className="inline-flex items-center justify-center h-6 px-2 text-(--nav-text)/75 hover:text-(--nav-text-active) transition-colors duration-150 rounded-md text-xs gap-1"
                      title="Ask Mode - Chat with portfolio"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        />
                      </svg>
                      ask
                    </button>
                    <Link
                      href="/cv"
                      className="hidden sm:inline-flex items-center justify-center h-6 px-2 text-(--nav-text)/75 hover:text-(--nav-text-active) transition-colors duration-150 rounded-md text-xs"
                    >
                      cv
                    </Link>
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

      <AnimatePresence>
        {showChat && <ChatInterface onClose={() => setShowChat(false)} />}
      </AnimatePresence>
    </>
  );
}
