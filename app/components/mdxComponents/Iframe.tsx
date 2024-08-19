import React from 'react';

export function Iframe({ src }) {
  return (
    <iframe
      src={src}
      loading="lazy"
      allow="web-share; clipboard-write"
      title="Embedded content"
      className="w-full h-[600px] rounded-lg border-2 border-[var(--bronzer)]/50 block mx-auto"
    />
  );
}
