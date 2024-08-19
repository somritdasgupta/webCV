import React from 'react';

export function BlockQuote({ children }) {
  return <blockquote className="border-l-3 border-[var(--bronzer)] pl-4 py-2 my-8 italic">{children}</blockquote>;
}