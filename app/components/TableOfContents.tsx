"use client";

import React, { useState, useEffect } from "react";
import { RiListCheck2, RiCloseLine } from "react-icons/ri";

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const extractHeadings = () => {
      const headingElements = document.querySelectorAll(
        "h1, h2, h3, h4, h5, h6"
      );
      const headingList: TOCItem[] = [];

      headingElements.forEach((heading) => {
        if (heading.id && heading.textContent) {
          headingList.push({
            id: heading.id,
            text: heading.textContent.replace("#", "").trim(),
            level: parseInt(heading.tagName.charAt(1)),
          });
        }
      });

      setHeadings(headingList);
    };

    // Extract headings after content loads
    const timer = setTimeout(extractHeadings, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const observerOptions = {
      rootMargin: "-20% 0% -35% 0%",
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    }, observerOptions);

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [headings]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      setIsOpen(false);
    }
  };

  if (headings.length === 0) return null;

  return (
    <>
      {/* Mobile TOC Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 lg:hidden bg-[var(--bronzer)] text-white p-3 rounded-full shadow-lg hover:scale-110 transition-all duration-300"
        aria-label="Table of Contents"
      >
        {isOpen ? <RiCloseLine size={24} /> : <RiListCheck2 size={24} />}
      </button>

      {/* Desktop TOC Sidebar */}
      <div className="hidden lg:block fixed right-8 top-1/2 transform -translate-y-1/2 z-30 max-w-xs">
        <div className="bg-[var(--card-bg)] backdrop-blur-sm border border-[var(--callout-border)] rounded-lg p-4 shadow-lg">
          <h3 className="text-sm font-semibold text-[var(--text-color)] mb-3 flex items-center">
            <RiListCheck2 className="mr-2" size={16} />
            Table of Contents
          </h3>
          <nav className="space-y-1 max-h-96 overflow-y-auto">
            {headings.map(({ id, text, level }) => (
              <button
                key={id}
                onClick={() => scrollToHeading(id)}
                className={`
                  block w-full text-left text-xs hover:text-[var(--bronzer)] transition-colors duration-200
                  ${activeId === id ? "text-[var(--bronzer)] font-medium" : "text-[var(--text-p)]"}
                  ${level === 2 ? "pl-0" : level === 3 ? "pl-3" : level === 4 ? "pl-6" : "pl-0"}
                `}
                style={{ paddingLeft: `${(level - 2) * 12}px` }}
              >
                {text}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile TOC Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-[var(--bg-color)] border-t border-[var(--callout-border)] rounded-t-lg p-6 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--text-color)] flex items-center">
                <RiListCheck2 className="mr-2" size={20} />
                Table of Contents
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[var(--text-p)] hover:text-[var(--text-color)]"
              >
                <RiCloseLine size={24} />
              </button>
            </div>
            <nav className="space-y-2">
              {headings.map(({ id, text, level }) => (
                <button
                  key={id}
                  onClick={() => scrollToHeading(id)}
                  className={`
                    block w-full text-left text-sm hover:text-[var(--bronzer)] transition-colors duration-200
                    ${activeId === id ? "text-[var(--bronzer)] font-medium" : "text-[var(--text-p)]"}
                  `}
                  style={{ paddingLeft: `${(level - 2) * 16}px` }}
                >
                  {text}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
