"use client";

import React from "react";
import { useFootnotes } from "./FootnoteContext";
import { FaExternalLinkAlt } from "react-icons/fa"; // Importing from react-icons

export function FootnoteList() {
  const { footnotes } = useFootnotes();

  const sortedFootnotes = Array.from(footnotes.entries())
    .sort(([idA], [idB]) => idA - idB)
    .map(([id, { text, link }]) => (
      <li key={id} >
        <a
          id={`footnote-${id}`}
          className="mr-1 light-text-color"
          href={`#footnote-${id}`}
        >
          [{id}]
        </a>
        <span className="inline !text-[var(--text-p)]">
          {text}
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Resource External link"
              className="ml-1 inline-flex items-center relative top-0.5"
            >
              <FaExternalLinkAlt className="h-3 light-text-color" />
            </a>
          )}
        </span>
      </li>
    ));

  return (
    <div id="footnote-list">
      <h3 className="text-xl font-semibold border-b-1 border-neutral-600 pb-2 mb-0">
        Footnotes
      </h3>
      <li className="list-none p-0">{sortedFootnotes}</li>
    </div>
  );
}
