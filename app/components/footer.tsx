import Link from "next/link";
import { RiArrowRightUpLine } from "react-icons/ri";
import { footerLinks } from "../lib/constants";

export default function Footer() {
  return (
    <footer className="mb-8">
      <ul className="font-sm mt-4 flex flex-col space-x-0 space-y-2 md:flex-row md:space-x-4 md:space-y-0">
        {footerLinks.map((link, index) => (
          <li className="!mb-0 !mt-2" key={index}>
            <a
              className="flex items-center text-[var(--text-p)] hover:text-[var(--bronzer)] hover:font-bold transition-all ease duration-600"
              rel="noopener noreferrer"
              target={link.href.startsWith("mailto:") ? "_self" : "_blank"}
              href={link.href}
            >
              <RiArrowRightUpLine className="text-lg mr-1 -ml-1" />
              <span className="h-7">{link.label}</span>
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-neutral-600 dark:text-neutral-400">
        © {new Date().getFullYear()} somritdasgupta
      </p>
    </footer>
  );
}
