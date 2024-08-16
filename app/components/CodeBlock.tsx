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
  const codeLines = highlightedCode.split("\n");

  if (inline) {
    return (
      <code
        dangerouslySetInnerHTML={{ __html: highlightedCode }}
        className="inline-code"
        {...props}
      />
    );
  }

  return (
    <div className="border-2 code-block relative my-4 rounded-lg overflow-hidden bg-[var(--header-bg-color)] border-[var(--code-border)]">
      {filename && (
        <div className="flex items-center justify-between bg-[#2d2d2d] px-4 py-2 text-xs text-gray-200">
          <span>{filename}</span>
          <span>{lang}</span>
        </div>
      )}
      <div className="relative flex">
        <div className="bg-[var(--code-border)] text-center indent-1.5 select-none py-4 pr-2 flex flex-col items-end">
          {codeLines.map((_, index) => (
            <div
              key={index}
              className="leading-6 text-[0.65rem]"
              style={{ color: "var(--sh-class)" }}
            >
              {index + 1}
            </div>
          ))}
        </div>
        <pre className="p-4 overflow-x-auto flex-1">
          <code
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
            className="text-sm leading-5"
            {...props}
          />
        </pre>
        <button
          onClick={copyToClipboard}
          className="absolute top-2 right-2 p-1 rounded-md bg-[var(--code-border)] text-gray-400 hover:text-white transition-colors"
          aria-label="Copy code"
        >
          {isCopied ? (
            <HiOutlineClipboardCheck className="h-4 w-4" />
          ) : (
            <HiOutlineClipboardCopy className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
