import React from "react";

export function Paragraph({ children }) {
  return (
    <p className="my-8 text-base leading-8 text-current">
      {typeof children === "string" ? (
        <span
          dangerouslySetInnerHTML={{
            __html: children.replace(
              /~~(.*?)~~/g,
              '<del class="line-through">$1</del>'
            ),
          }}
        />
      ) : (
        children
      )}
    </p>
  );
}
