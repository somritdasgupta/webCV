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
      <code dangerouslySetInnerHTML={{ __html: highlightedCode }} {...props} />
    );
  }

  return (
    <div className="border-3 p-1 code-block relative my-4 rounded-lg overflow-hidden bg-[var(--tweet-bg)] border-[var(--code-border)]">
      {/* Tabs at the top */}
      <div className="tabs flex rounded-md items-center justify-between bg-[var(--code-border)] text-slate-300 text-xs">
        <div className="tab-info flex items-center  py-2">
          {filename && <span className="filename">{filename}</span>}
          <span className="language ml-2">{lang}</span>
        </div>
        <button
          onClick={copyToClipboard}
          className="copy-button p-1 text-gray-500 hover:text-violet-500 transition ease duration-600"
          aria-label="Copy code"
        >
          {isCopied ? (
            <HiOutlineClipboardCheck className="h-4 w-4 animate-pulse" />
          ) : (
            <HiOutlineClipboardCopy className="h-4 w-4" />
          )}
        </button>
      </div>
      {/* Code block */}
      <pre className="p-4 overflow-x-auto flex-1 rounded-md">
        <code
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
          className="text-sm leading-5"
          {...props}
        />
      </pre>
    </div>
  );
}
