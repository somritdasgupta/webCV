import Link from "next/link";
import React from "react";

export function CustomLink({ href, ...props }) {
  const className =
    "text-[var(--bronzer)] hover:text-[var(--text-color)] underline underline-offset-2 transition-colors duration-200";

  if (href.startsWith("/")) {
    return (
      <Link href={href} className={className} {...props}>
        {props.children}
      </Link>
    );
  }

  if (href.startsWith("#")) {
    return <a className={className} {...props} />;
  }

  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      {...props}
    />
  );
}
