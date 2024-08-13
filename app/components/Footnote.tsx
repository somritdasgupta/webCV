// components/Footnote.tsx
"use client";

import React from "react";
import { useFootnotes } from "./FootnoteContext";

interface FootnoteProps {
  id: number;
  text: string;
  link?: string; // Add optional link property
}

export function Footnote({ id, text, link }: FootnoteProps) {
  const { addFootnote, updateFootnote, removeFootnote } = useFootnotes();

  React.useEffect(() => {
    if (text) {
      addFootnote(id, text, link); // Pass the link if available

      return () => {
        removeFootnote(id);
      };
    }
  }, [id, text, link, addFootnote, removeFootnote]);

  React.useEffect(() => {
    updateFootnote(id, text, link); // Update with link if available
  }, [id, text, link, updateFootnote]);

  return (
    <a id={`footnote-${id}`} className="footnote-ref" href={`#footnote-list`}>
      [{id}]
    </a>
  );
}
