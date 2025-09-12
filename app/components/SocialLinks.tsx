"use client";

import { footerLinks } from "../lib/constants";

interface SocialLinksProps {
  variant?: "footer" | "navbar";
  className?: string;
}

export default function SocialLinks({
  variant = "footer",
  className = "",
}: SocialLinksProps) {
  // Function to truncate text if needed
  const truncateText = (text: string, maxLength: number = 12) => {
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  if (variant === "footer") {
    return (
      <ul
        className={`font-sm mt-4 flex flex-col space-x-0 space-y-2 md:flex-row md:space-x-4 md:space-y-0 ${className}`}
      >
        {footerLinks.map((link, index) => (
          <li className="!mb-0 !mt-2" key={index}>
            <a
              className="flex items-center text-[var(--text-p)] hover:text-[var(--bronzer)] hover:font-bold transition-all ease duration-600"
              rel="noopener noreferrer"
              target={link.href.startsWith("mailto:") ? "_self" : "_blank"}
              href={link.href}
            >
              <span className="h-7">{truncateText(link.label)}</span>
            </a>
          </li>
        ))}
      </ul>
    );
  }

  // Navbar variant
  return (
    <div className={`flex flex-col space-y-1 ${className}`}>
      {footerLinks.slice(0, 3).map((link) => (
        <a
          key={link.label}
          href={link.href}
          target={link.href.startsWith("mailto:") ? "_self" : "_blank"}
          rel={
            link.href.startsWith("mailto:") ? undefined : "noopener noreferrer"
          }
          className="flex items-center justify-center w-full h-8 text-xs text-[var(--nav-text)]/70 hover:text-[var(--nav-text-active)] hover:bg-[var(--nav-pill-bg)]/50 rounded-lg transition-colors duration-150"
        >
          {truncateText(link.label)}
        </a>
      ))}
    </div>
  );
}
