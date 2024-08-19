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
      className="!text-violet-500 hover:!text-red-500 font-medium"
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
      <li key={id} className="flex align-text-top space-x-1 mb-2">
        <a
          id={`footnote-${id}`}
          className="!text-violet-500 hover:!text-red-500 font-medium text-sm"
          href={`#footnote-${id}`}
        >
          [{id}]
        </a>
        <span className="text-[var(--text-p)] text-sm">
          {text}
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Resource External link"
              className="ml-1 inline-flex items-center"
            >
              <FaExternalLinkAlt className="h-3 w-3 !text-violet-500 hover:!text-red-500" />
            </a>
          )}
        </span>
      </li>
    ));

  return (
    <div id="footnote-list" className="mt-6">
      <h3 className="text-2xl font-semibold border-b-1 border-gray-600 pb-2 mb-4">
        Footnotes
      </h3>
      <ul className="list-none p-0">{sortedFootnotes}</ul>
    </div>
  );
}
