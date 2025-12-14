"use client";

import React, { useState } from "react";
import { highlight } from "sugar-high";
import {
  HiOutlineClipboardCopy,
  HiOutlineClipboardCheck,
  HiOutlineCode,
} from "react-icons/hi";

interface CodeProps {
  children: string;
  className?: string;
  filename?: string;
  inline?: boolean;
  language?: string;
}

export function CodeBlock({
  children,
  className,
  filename,
  language,
  inline = false,
  ...props
}: CodeProps) {
  const [isCopied, setIsCopied] = useState(false);
  const lang = language || className?.replace(/language-/, "") || "text";

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const highlightedCode = highlight(children);

  if (inline) {
    return (
      <code
        dangerouslySetInnerHTML={{ __html: highlightedCode }}
        className="px-1.5 py-1 text-sm rounded bg-[var(--callout-bg)] text-[var(--bronzer)] border border-[var(--callout-border)]/30 font-mono break-words whitespace-pre-wrap"
        style={{
          fontFamily:
            'var(--font-geist-mono), "SF Mono", Monaco, Inconsolata, "Roboto Mono", Consolas, "Droid Sans Mono", monospace',
        }}
        {...props}
      />
    );
  }

  return (
    <div className="my-6 rounded-xl overflow-hidden bg-[var(--bg-color)] border border-[var(--callout-border)] shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between bg-[var(--header-bg-color)] px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Window Dots */}
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>

          {/* File Info */}
          <div className="flex items-center gap-2">
            <HiOutlineCode className="w-4 h-4 text-[var(--bronzer)]" />
            {filename ? (
              <span className="text-sm font-medium text-[var(--text-color)]">
                {filename}
              </span>
            ) : (
              <span className="text-sm text-[var(--text-p)]/70">{lang}</span>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Copy Button */}
          <button
            onClick={copyToClipboard}
            className="p-1.5 rounded-md hover:bg-[var(--nav-pill)] transition-colors duration-200 text-[var(--text-p)] hover:text-[var(--bronzer)]"
            title="Copy code"
            aria-label="Copy code"
          >
            {isCopied ? (
              <HiOutlineClipboardCheck className="w-4 h-4 text-[var(--bronzer)]" />
            ) : (
              <HiOutlineClipboardCopy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Code Content */}
      <div className="relative bg-[var(--bg-color)]">
        <pre
          className="custom-codeblock px-4 py-4 text-sm leading-6 bg-[var(--bg-color)] whitespace-pre-wrap break-words overflow-x-hidden"
          style={{
            fontFamily:
              'var(--font-geist-mono), "SF Mono", Monaco, Inconsolata, "Roboto Mono", Consolas, "Droid Sans Mono", monospace',
          }}
        >
          <code
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
            className="text-[var(--text-color)] block"
            {...props}
          />
        </pre>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between bg-[var(--header-bg-color)] px-4 py-2">
        <div className="flex items-center gap-4">
          <span className="text-xs text-[var(--text-p)]/70">
            Lines: {children.split("\n").length}
          </span>
          <span className="text-xs text-[var(--text-p)]/70">
            {lang.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--text-p)]/50">Wrapped</span>
          <div
            className={`w-2 h-2 rounded-full ${isCopied ? "bg-green-500" : "bg-[var(--bronzer)]"}`}
          ></div>
        </div>
      </div>
    </div>
  );
}
