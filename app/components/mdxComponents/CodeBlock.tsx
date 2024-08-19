"use client";

import React, { useState } from "react";
import { highlight } from "sugar-high";
import {
  HiOutlineClipboardCopy,
  HiOutlineClipboardCheck,
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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(children);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const highlightedCode = highlight(children);

  if (inline) {
    return (
      <code
        dangerouslySetInnerHTML={{ __html: highlightedCode }}
        className="px-1 py-0.5 text-xs rounded-md bg-[var(--callout-bg)]/75 text-[var(--text-color)] border border-[var(--code-border)]"
        {...props}
      />
    );
  }

  return (
    <div className="my-4 rounded-lg overflow-hidden bg-[var(--post-title-bg)]/75 border border-[var(--code-border)]">
      <div className="flex items-center justify-between bg-[var(--callout-border)]/50 border-2 border-[var(--code-border)] text-[var(--text-p)] text-xs p-1 rounded-md">
        <div className="flex items-center p-1">
          {filename && (
            <span className="mr-2 text-[var(--text-color)] dark:text-[var(--light-text-color)]">
              {filename}
            </span>
          )}
          <span>{lang}</span>
        </div>
        <button
          onClick={copyToClipboard}
          className="p-1 hover:text-[var(--bronzer)] transition-colors duration-500 ease-in-out"
          aria-label="Copy code"
        >
          {isCopied ? (
            <HiOutlineClipboardCheck className="h-4 w-4 text-[var(--bronzer)] animate-pulse" />
          ) : (
            <HiOutlineClipboardCopy className="h-4 w-4 text-[var(--text-p)]" />
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
          className="text-sm leading-6 text-[var(--text-color)] dark:text-[var(--light-text-color)]"
          {...props}
        />
      </pre>
    </div>
  );
}
