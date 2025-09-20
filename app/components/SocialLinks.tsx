"use client";

import { footerLinks, socialLinks } from "../lib/constants";

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
      <div
        className={`flex items-center space-x-4 overflow-x-auto hide-scrollbar ${className}`}
      >
        {footerLinks.map((link, index) => (
          <a
            key={index}
            className="flex-shrink-0 px-3 py-1 text-[var(--text-p)] hover:text-[var(--bronzer)] transition-colors duration-150 whitespace-nowrap"
            rel="noopener noreferrer"
            target={link.href.startsWith("mailto:") ? "_self" : "_blank"}
            href={link.href}
          >
            {truncateText(link.label, 18)}
          </a>
        ))}
      </div>
    );
  }

  // Navbar variant - inline small links
  return (
    <div
      className={`flex items-center justify-center space-x-2 text-xs ${className}`}
    >
      {socialLinks.map((link) => (
        <a
          key={link.name ?? link.href}
          href={link.href}
          target={link.href.startsWith("mailto:") ? "_self" : "_blank"}
          rel={
            link.href.startsWith("mailto:") ? undefined : "noopener noreferrer"
          }
          className="inline-flex items-center justify-center h-6 px-2 text-[var(--nav-text)]/75 hover:text-[var(--nav-text-active)] transition-colors duration-150 rounded-md"
        >
          {truncateText((link.name as string) || link.href, 10)}
        </a>
      ))}
    </div>
  );
}
