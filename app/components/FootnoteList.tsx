"use client";

import React from "react";
import { useFootnotes } from "./FootnoteContext";
import { FaExternalLinkAlt } from "react-icons/fa"; // Importing from react-icons

export function FootnoteList() {
  const { footnotes } = useFootnotes();

  const sortedFootnotes = Array.from(footnotes.entries())
    .sort(([idA], [idB]) => idA - idB)
    .map(([id, { text, link }]) => (
      <li key={id} className="footnote-item">
        <a
          id={`footnote-${id}`}
          className="footnote-ref mr-2 light-text-color"
          href={`#footnote-${id}`}
        >
          [{id}]
        </a>
        <span className="inline">
          {text}
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Resource External link"
              className="ml-1 inline-flex items-center relative top-0.5"
            >
              <FaExternalLinkAlt className="h-4 light-text-color" />
            </a>
          )}
        </span>
      </li>
    ));

  return (
    <div id="footnote-list" className="footnote-container footnotes">
      <h3 className="text-xl font-semibold mb-2 border-b-1 border-neutral-600 pb-2">
        Footnotes
      </h3>
      <li className="list-none p-0">{sortedFootnotes}</li>
    </div>
  );
}
