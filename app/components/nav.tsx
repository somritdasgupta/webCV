"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { usePathname } from "next/navigation";

const navItems = {
  "/": {
    name: "home",
  },
  "/blog": {
    name: "blog",
  },
  "/projects": {
    name: "projects",
  },
};

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <aside
      className={`sticky top-2 left-0 z-100 rounded-xl h-12 w-fit transition-all duration-300 ${
        isScrolled
          ? "mb-6 px-2 bg-[var(--nav-pill)]/85 backdrop-blur-sm border-3 border-[var(--code-border)] transform hover:-translate-y-0.2"
          : "bg-transparent border-transparent mb-6"
      }`}
    >
      <nav
        className="flex flex-row items-center -ml-[12px] text-[var(--text-p)]"
        id="nav"
      >
        <div className="flex flex-row">
          {Object.entries(navItems).map(([path, { name }]) => {
            const isActive = pathname === path;
            return (
              <Link
                key={path}
                href={path}
                className={`transition-all duration-300 relative py-1 px-2 m-1 ${
                  isActive ? "font-black" : ""
                } ${
                  isScrolled
                    ? "hover:text-[var(--text-p)]/80 hover:font-semibold active:transform active:translate-y-0.5 ease duration-300"
                    : "hover:text-[var(--text-p)]/80 hover:font-semibold active:transform active:translate-y-0 ease duration-300"
                }`}
              >
                {name}
              </Link>
            );
          })}
          <ThemeSwitcher className="ml-1" />
        </div>
      </nav>
    </aside>
  );
}
