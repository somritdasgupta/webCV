import React from "react";

export function BlockQuote({ children }) {
  return (
    <blockquote className="border-l-4 border-[var(--bronzer)] pl-6 py-4 my-8 italic bg-transparent text-[var(--text-p)] backdrop-blur-sm">
      {children}
    </blockquote>
  );
}
