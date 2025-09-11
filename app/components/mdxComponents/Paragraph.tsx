import React from "react";

export function Paragraph({ children }) {
  return (
    <p className="my-6 text-base leading-7 text-[var(--text-p)]">
      {typeof children === "string" ? (
        <span
          dangerouslySetInnerHTML={{
            __html: children.replace(
              /~~(.*?)~~/g,
              '<del class="line-through text-[var(--text-p)]/70">$1</del>'
            ),
          }}
        />
      ) : (
        children
      )}
    </p>
  );
}
