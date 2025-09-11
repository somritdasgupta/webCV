import React from "react";

export function Iframe({ src }) {
  return (
    <div className="my-8">
      <iframe
        src={src}
        loading="lazy"
        allow="web-share; clipboard-write"
        title="Embedded content"
        className="w-full h-[600px] bg-transparent border border-[var(--callout-border)] rounded-lg shadow-sm"
      />
    </div>
  );
}
