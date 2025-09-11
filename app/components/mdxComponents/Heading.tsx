import React from "react";

function slugify(str) {
  return str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/&/g, "-and-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

export function createHeading(level) {
  return ({ children }) => {
    const slug = slugify(children);
    const sizeClasses = {
      1: "text-4xl font-bold mt-12 mb-6",
      2: "text-3xl font-semibold mt-10 mb-5",
      3: "text-2xl font-medium mt-8 mb-4",
      4: "text-xl font-medium mt-6 mb-3",
    };

    return React.createElement(
      `h${level}`,
      {
        id: slug,
        className: `relative ${sizeClasses[level]} text-[var(--text-color)] group`,
      },
      [
        React.createElement(
          "a",
          {
            href: `#${slug}`,
            key: `link-${slug}`,
            className: `absolute -left-6 text-[var(--bronzer)] text-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                      focus:opacity-100 focus:outline-none cursor-pointer hover:text-[var(--text-color)]`,
            "aria-hidden": true,
            "aria-label": `Anchor for ${children}`,
          },
          "#"
        ),
      ],
      children
    );
  };
}
