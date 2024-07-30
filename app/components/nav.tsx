// components/Navbar.tsx

'use client';

import Link from 'next/link';
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
  },
}

export function Navbar() {
  return (
    <aside className="-ml-[12px] mb-8 tracking-tight">
      <div className="lg:sticky lg:top-20">
        <nav
          className="flex flex-row items-center relative px-0 pb-0 fade md:overflow-auto scroll-pr-6 md:relative"
          id="nav"
        >
          <div className="flex flex-row space-x-0 pr-10">
            {Object.entries(navItems).map(([path, { name }]) => {
              return (
                <Link
                  key={path}
                  href={path}
                  className="transition-all hover:text-neutral-800 dark:hover:text-neutral-200 flex align-middle relative py-1 px-2 m-1"
                >
                  {name}
                </Link>
              )
            })}          
          <ThemeSwitcher className="ml-1" />
          </div>
        </nav>
      </div>
    </aside>
  )
}

