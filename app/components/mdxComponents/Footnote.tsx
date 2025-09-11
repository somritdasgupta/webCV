"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { FaExternalLinkAlt } from "react-icons/fa";

// Footnote Context and Provider
interface FootnoteContextProps {
  footnotes: Map<number, { text: string; link?: string }>;
  addFootnote: (id: number, text: string, link?: string) => void;
  removeFootnote: (id: number) => void;
  updateFootnote: (id: number, text: string, link?: string) => void;
}

const FootnoteContext = createContext<FootnoteContextProps>({
  footnotes: new Map(),
  addFootnote: () => {},
  removeFootnote: () => {},
  updateFootnote: () => {},
});

export const FootnoteProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [footnotes, setFootnotes] = useState<
    Map<number, { text: string; link?: string }>
  >(new Map());

  const addFootnote = useCallback((id: number, text: string, link?: string) => {
    setFootnotes((prev) => new Map(prev).set(id, { text, link }));
  }, []);

  const removeFootnote = useCallback((id: number) => {
    setFootnotes((prev) => {
      const updated = new Map(prev);
      updated.delete(id);
      return updated;
    });
  }, []);

  const updateFootnote = useCallback(
    (id: number, text: string, link?: string) => {
      setFootnotes((prev) => {
        const updated = new Map(prev);
        updated.set(id, { text, link });
        return updated;
      });
    },
    []
  );

  return (
    <FootnoteContext.Provider
      value={{ footnotes, addFootnote, removeFootnote, updateFootnote }}
    >
      {children}
    </FootnoteContext.Provider>
  );
};

export const useFootnotes = () => useContext(FootnoteContext);

// Footnote Component
interface FootnoteProps {
  id: number;
  text: string;
  link?: string;
}

export function Footnote({ id, text, link }: FootnoteProps) {
  const { addFootnote, updateFootnote, removeFootnote } = useFootnotes();

  React.useEffect(() => {
    if (text) {
      addFootnote(id, text, link);
      return () => {
        removeFootnote(id);
      };
    }
  }, [id, text, link, addFootnote, removeFootnote]);

  React.useEffect(() => {
    updateFootnote(id, text, link);
  }, [id, text, link, updateFootnote]);

  return (
    <a
      id={`footnote-${id}`}
      className="text-[var(--bronzer)] hover:text-[var(--text-color)] font-medium text-xs transition-colors duration-200"
      href={`#footnote-list`}
    >
      [{id}]
    </a>
  );
}

// FootnoteList Component
export function FootnoteList() {
  const { footnotes } = useFootnotes();

  const sortedFootnotes = Array.from(footnotes.entries())
    .sort(([idA], [idB]) => idA - idB)
    .map(([id, { text, link }]) => (
      <li key={id} className="flex align-text-top space-x-3 mb-3 text-sm">
        <a
          id={`footnote-${id}`}
          className="text-[var(--bronzer)] hover:text-[var(--text-color)] font-medium text-sm transition-colors duration-200 flex-shrink-0"
          href={`#footnote-${id}`}
        >
          [{id}]
        </a>
        <span className="text-[var(--text-p)] leading-relaxed">
          {text}
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Resource External link"
              className="ml-2 inline-flex items-center text-[var(--bronzer)] hover:text-[var(--text-color)] transition-colors duration-200"
            >
              <FaExternalLinkAlt className="h-3 w-3" />
            </a>
          )}
        </span>
      </li>
    ));
  return (
    <div id="footnote-list" className="mt-12">
      <h3 className="text-xl font-semibold text-[var(--text-color)] pb-2 mb-6 border-b border-[var(--callout-border)]">
        Footnotes
      </h3>
      <ul className="list-none p-0 space-y-2">{sortedFootnotes}</ul>
    </div>
  );
}
