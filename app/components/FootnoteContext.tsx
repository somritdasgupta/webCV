"use client";
import React, { createContext, useContext, useState, useCallback } from "react";

interface FootnoteContextProps {
  footnotes: Map<number, { text: string; link?: string }>; // Updated to include link
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
