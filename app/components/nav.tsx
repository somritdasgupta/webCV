// components/Navbar.tsx

'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ThemeSwitcher } from './ThemeSwitcher'; // Adjust path as needed

const navItems = {
  '/': {
    name: 'home',
  },
  '/blog': {
    name: 'blog',
  },
  '/projects': {
    name: 'projects',
  }
}

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 250);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <aside className={`navbar ${isScrolled ? 'scrolled' : ''} ${isScrolled ? 'sticky' : 'static'}`}>
      <nav
        className="flex flex-row items-center -ml-[12px] mb-8 tracking-tight"
        id="nav"
      >
        <div className="flex flex-row">
          {Object.entries(navItems).map(([path, { name }]) => {
            return (
              <Link
                key={path}
                href={path}
                className="transition-all  relative py-1 px-2 m-1"
              >
                {name}
              </Link>
            )
          })}
          <ThemeSwitcher className="ml-1" />
        </div>
      </nav>
    </aside>
  )
}