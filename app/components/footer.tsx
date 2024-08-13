import Link from "next/link";
import { ArrowUpRightIcon } from "@heroicons/react/24/solid";

const links = [
  { href: "/rss", label: "rss" },
  { href: "/json", label: "json" },
  { href: "mailto:somritdasgupta@outlook.com", label: "mail" },
  { href: "https://github.com/somritdasgupta", label: "github" },
  { href: "https://linkedin.com/in/somritdasgupta", label: "linkedIn" },
];

export default function Footer() {
  return (
    <footer className="mb-8">
      <ul className="font-sm mt-4 flex flex-col space-x-0 space-y-2 md:flex-row md:space-x-4 md:space-y-0">
        {links.map((link, index) => (
          <li key={index}>
            <a
              className="flex items-center text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
              rel="noopener noreferrer"
              target={link.href.startsWith("mailto:") ? "_self" : "_blank"}
              href={link.href}
            >
              <ArrowUpRightIcon className="w-3 h-3 mr-1" />
              <span className="h-7">{link.label}</span>
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-neutral-600 dark:text-neutral-400">
        © {new Date().getFullYear()} Somrit Dasgupta
      </p>
    </footer>
  );
}
