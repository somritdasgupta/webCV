"use client";

import React, { useState, useEffect } from "react";
import { RiArrowUpLine } from "react-icons/ri";

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 left-6 z-40 bg-[var(--bronzer)] text-white p-3 rounded-full shadow-lg hover:scale-110 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--bronzer)] focus:ring-offset-2 focus:ring-offset-[var(--bg-color)]"
      aria-label="Back to top"
    >
      <RiArrowUpLine size={20} />
    </button>
  );
}
