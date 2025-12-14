"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { RiListCheck2, RiCloseLine } from "react-icons/ri";
import { BiBookmark } from "react-icons/bi";
import { HiOutlineChevronRight } from "react-icons/hi";

interface TOCItem {
  id: string;
  text: string;
  level: number;
  element: Element;
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const tocRef = useRef<HTMLDivElement>(null);

  // Clean and extract text from heading elements
  const cleanHeadingText = (element: Element): string => {
    let text = element.textContent || "";
    // Remove hash symbols, extra whitespace, and special characters
    text = text
      .replace(/^#+\s*/, "") // Remove leading hashes
      .replace(/[#*`~]/g, "") // Remove markdown symbols
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();
    return text;
  };

  // Extract headings with robust error handling
  useEffect(() => {
    const extractHeadings = () => {
      try {
        // Target article or main content area
        const contentArea =
          document.querySelector("article, main, .content") || document;
        const headingElements = contentArea.querySelectorAll(
          "h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]"
        );

        const headingList: TOCItem[] = [];
        const seenIds = new Set<string>();

        headingElements.forEach((heading) => {
          const id = heading.id;
          const text = cleanHeadingText(heading);

          // Validate heading has ID, text, and hasn't been seen
          if (id && text && !seenIds.has(id)) {
            seenIds.add(id);
            headingList.push({
              id,
              text,
              level: parseInt(heading.tagName.charAt(1)),
              element: heading,
            });
          }
        });

        if (headingList.length > 0) {
          setHeadings(headingList);
        }
      } catch (error) {
        console.error("Error extracting headings:", error);
      }
    };

    // Extract immediately and after a delay for dynamic content
    extractHeadings();
    const timer = setTimeout(extractHeadings, 800);

    // Re-extract on DOM changes (for dynamic content)
    const observer = new MutationObserver(extractHeadings);
    const article = document.querySelector("article, main");
    if (article) {
      observer.observe(article, { childList: true, subtree: true });
    }

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  // Track active heading with improved intersection observer
  useEffect(() => {
    if (headings.length === 0) return;

    const observerOptions: IntersectionObserverInit = {
      rootMargin: "-10% 0px -70% 0px",
      threshold: [0, 0.25, 0.5, 0.75, 1],
    };

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      const visibleEntries = entries.filter((entry) => entry.isIntersecting);

      if (visibleEntries.length > 0) {
        // Find the most visible heading
        const mostVisible = visibleEntries.reduce((prev, current) => {
          return current.intersectionRatio > prev.intersectionRatio
            ? current
            : prev;
        });

        setActiveId(mostVisible.target.id);
      }
    };

    observerRef.current = new IntersectionObserver(
      handleIntersection,
      observerOptions
    );

    headings.forEach(({ element }) => {
      if (element) {
        observerRef.current?.observe(element);
      }
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [headings]);

  // Calculate reading progress
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const scrollPercentage =
        (scrollTop / (documentHeight - windowHeight)) * 100;
      setProgress(Math.min(100, Math.max(0, scrollPercentage)));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Smooth scroll to heading with offset
  const scrollToHeading = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Header offset
      const elementPosition =
        element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      setIsOpen(false);

      // Update URL hash without jumping
      if (history.pushState) {
        history.pushState(null, "", `#${id}`);
      }
    }
  }, []);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  if (headings.length === 0) return null;

  const activeIndex = headings.findIndex((h) => h.id === activeId);
  const progressPercentage =
    headings.length > 0 ? ((activeIndex + 1) / headings.length) * 100 : 0;

  return (
    <>
      {/* Mobile TOC Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 lg:hidden bg-[var(--bronzer)] text-white p-3 rounded-lg shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200"
        aria-label="Table of Contents"
        aria-expanded={isOpen}
      >
        <div className="relative">
          {isOpen ? <RiCloseLine size={20} /> : <RiListCheck2 size={20} />}
          {!isOpen && headings.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-white text-[var(--bronzer)] text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {headings.length}
            </span>
          )}
        </div>
      </button>

      {/* Desktop TOC Sidebar - Minimalist Design */}
      <div className="hidden lg:block fixed right-6 top-24 z-30 w-56">
        <div className="bg-[var(--card-bg)]/40 backdrop-blur-sm border-l-2 border-[var(--bronzer)]/20 pl-4 pr-2 py-3">
          {/* Minimal header */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-p)]/60">
              Contents
            </span>
            <span className="text-[10px] text-[var(--text-p)]/40">
              {activeIndex + 1}/{headings.length}
            </span>
          </div>

          {/* Navigation - Clean list */}
          <nav className="space-y-1 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
            {headings.map(({ id, text, level }) => {
              const isActive = activeId === id;
              const indent = (level - 2) * 12;

              return (
                <button
                  key={id}
                  onClick={() => scrollToHeading(id)}
                  className={`
                    group relative block w-full text-left py-1.5 transition-all duration-150
                    ${
                      isActive
                        ? "text-[var(--bronzer)] font-medium"
                        : "text-[var(--text-p)]/70 hover:text-[var(--text-color)]"
                    }
                  `}
                  style={{ paddingLeft: `${indent}px` }}
                  aria-current={isActive ? "location" : undefined}
                >
                  {/* Minimal active indicator */}
                  {isActive && (
                    <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-[var(--bronzer)] rounded-full" />
                  )}

                  <span className="text-xs leading-snug line-clamp-2">
                    {text}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Minimal progress indicator */}
          <div className="mt-3 pt-2 border-t border-[var(--bronzer)]/10">
            <div className="h-0.5 bg-[var(--bronzer)]/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--bronzer)] transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile TOC Overlay - Simplified */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <div className="absolute bottom-0 left-0 right-0 bg-[var(--bg-color)] border-t-2 border-[var(--bronzer)]/20 rounded-t-xl max-h-[75vh] overflow-hidden animate-slide-up">
            {/* Simple header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--bronzer)]/10">
              <div>
                <h3 className="text-base font-semibold text-[var(--text-color)]">
                  Contents
                </h3>
                <p className="text-xs text-[var(--text-p)]/60 mt-0.5">
                  {activeIndex + 1} of {headings.length}
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-[var(--bronzer)]/10 rounded-lg transition-colors"
                aria-label="Close"
              >
                <RiCloseLine size={22} className="text-[var(--text-p)]" />
              </button>
            </div>

            {/* Clean list */}
            <nav
              className="p-4 space-y-0.5 overflow-y-auto"
              style={{ maxHeight: "calc(75vh - 80px)" }}
            >
              {headings.map(({ id, text, level }) => {
                const isActive = activeId === id;
                const indent = (level - 2) * 16;

                return (
                  <button
                    key={id}
                    onClick={() => scrollToHeading(id)}
                    className={`
                      relative block w-full text-left py-2.5 px-3 rounded-lg transition-all duration-150
                      ${
                        isActive
                          ? "bg-[var(--bronzer)]/10 text-[var(--bronzer)] font-medium"
                          : "text-[var(--text-p)] hover:bg-[var(--bronzer)]/5"
                      }
                    `}
                    style={{ paddingLeft: `${12 + indent}px` }}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[var(--bronzer)] rounded-r" />
                    )}
                    <span className="text-sm">{text}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
