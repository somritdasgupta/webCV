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
      1: "text-4xl font-bold mt-8 mb-4",
      2: "text-3xl font-medium mt-7 mb-3",
      3: "text-2xl font-medium mt-6 mb-2",
      4: "text-xl font-medium mt-5 mb-2",
    };

    return React.createElement(
      `h${level}`,
      {
        id: slug,
        className: `relative my-12 ${sizeClasses[level]} text-current group`,
      },
      [
        React.createElement(
          "a",
          {
            href: `#${slug}`,
            key: `link-${slug}`,
            className: `absolute -left-4 text-[var(--text-p)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                      focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-[var(--bronzer)] cursor-pointer`,
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
