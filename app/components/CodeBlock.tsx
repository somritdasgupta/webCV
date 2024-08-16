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
    <div className="border-2 code-block relative my-4 rounded-lg overflow-hidden bg-[var(--code-border)] border-[var(--code-border)]">
      {/* Tabs at the top */}
      <div className="tabs flex rounded-lg items-center justify-between bg-[var(--code-border)] text-slate-300 text-xs">
        <div className="tab-info flex items-center  py-2">
          {filename && <span className="filename">{filename}</span>}
          <span className="language ml-2">{lang}</span>
        </div>
        <button
          onClick={copyToClipboard}
          className="copy-button p-1 rounded-md text-gray-500 hover:text-yellow-700 transition-colors"
          aria-label="Copy code"
        >
          {isCopied ? (
            <HiOutlineClipboardCheck className="h-4 w-4" />
          ) : (
            <HiOutlineClipboardCopy className="h-4 w-4" />
          )}
        </button>
      </div>
      {/* Code block */}
      <div className="relative flex rounded-lg bg-[var(--header-bg-color)]">
        <pre className="p-4 overflow-x-auto flex-1 rounded-lg bg-[var(--header-bg-color)]">
          <code
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
            className="text-sm leading-5"
            {...props}
          />
        </pre>
      </div>
    </div>
  );
}
