"use client";

import { HiExternalLink } from "react-icons/hi";
import { useState, useEffect } from "react";

interface BookmarkItem {
  title: string;
  url: string;
  description: string;
  icon?: string;
}

interface BookmarkCategory {
  title: string;
  items: BookmarkItem[];
}

// Complete bookmarks data (imported from the main bookmarks page)
const allBookmarkData: BookmarkCategory[] = [
  {
    title: "development tools",
    items: [
      {
        title: "Supabase",
        url: "https://supabase.com/",
        description: "Open source Firebase alternative with PostgreSQL backend",
        icon: "🚀",
      },
      {
        title: "VS Code",
        url: "https://code.visualstudio.com/",
        description: "Free, open-source code editor with extensive extensions",
        icon: "💻",
      },
      {
        title: "GitHub",
        url: "https://github.com/",
        description: "Free Git hosting with unlimited public repos",
        icon: "🐙",
      },
      {
        title: "Vercel",
        url: "https://vercel.com/",
        description: "Free deployment platform for frontend frameworks",
        icon: "▲",
      },
      {
        title: "Netlify",
        url: "https://www.netlify.com/",
        description: "Free hosting for static sites with CI/CD",
        icon: "🌐",
      },
      {
        title: "Railway",
        url: "https://railway.app/",
        description: "Free cloud platform for deploying apps and databases",
        icon: "🚂",
      },
      {
        title: "PlanetScale",
        url: "https://planetscale.com/",
        description: "Free MySQL platform with branching capabilities",
        icon: "🪐",
      },
      {
        title: "Neon",
        url: "https://neon.tech/",
        description: "Free PostgreSQL with serverless and branching",
        icon: "⚡",
      },
      {
        title: "Clerk",
        url: "https://clerk.com/",
        description: "Free authentication with generous limits",
        icon: "🔐",
      },
      {
        title: "Prisma",
        url: "https://www.prisma.io/",
        description: "Open-source ORM for TypeScript and Node.js",
        icon: "🔷",
      },
    ],
  },
  {
    title: "design & creativity",
    items: [
      {
        title: "Figma",
        url: "https://www.figma.com/",
        description: "Free collaborative design tool",
        icon: "🎨",
      },
      {
        title: "Excalidraw",
        url: "https://excalidraw.com/",
        description: "Free hand-drawn style diagramming tool",
        icon: "✏️",
      },
      {
        title: "Canva",
        url: "https://www.canva.com/",
        description: "Free graphic design platform",
        icon: "🖼️",
      },
      {
        title: "Unsplash",
        url: "https://unsplash.com/",
        description: "Free high-resolution photos",
        icon: "📸",
      },
      {
        title: "Coolors",
        url: "https://coolors.co/",
        description: "Color scheme generator and palette tool",
        icon: "🌈",
      },
      {
        title: "Google Fonts",
        url: "https://fonts.google.com/",
        description: "Free web fonts from Google",
        icon: "🔤",
      },
      {
        title: "Heroicons",
        url: "https://heroicons.com/",
        description: "Free SVG icons by the makers of Tailwind CSS",
        icon: "⭐",
      },
      {
        title: "Lucide",
        url: "https://lucide.dev/",
        description: "Beautiful & consistent icon toolkit",
        icon: "💎",
      },
    ],
  },
  {
    title: "free courses & learning",
    items: [
      {
        title: "freeCodeCamp",
        url: "https://www.freecodecamp.org/",
        description: "Free coding bootcamp and certifications",
        icon: "🏕️",
      },
      {
        title: "The Odin Project",
        url: "https://www.theodinproject.com/",
        description: "Free full-stack web development curriculum",
        icon: "⚔️",
      },
      {
        title: "CS50",
        url: "https://cs50.harvard.edu/",
        description: "Harvard's free computer science course",
        icon: "🎓",
      },
      {
        title: "Coursera",
        url: "https://www.coursera.org/",
        description: "Free courses from top universities",
        icon: "📚",
      },
      {
        title: "Khan Academy",
        url: "https://www.khanacademy.org/",
        description: "Free world-class education for anyone",
        icon: "🌍",
      },
      {
        title: "YouTube",
        url: "https://www.youtube.com/",
        description: "Endless free programming tutorials",
        icon: "📺",
      },
    ],
  },
  {
    title: "hosting & deployment",
    items: [
      {
        title: "Vercel",
        url: "https://vercel.com/",
        description: "Free deployment platform for frontend frameworks",
        icon: "▲",
      },
      {
        title: "Netlify",
        url: "https://www.netlify.com/",
        description: "Free hosting for static sites with CI/CD",
        icon: "🌐",
      },
      {
        title: "Railway",
        url: "https://railway.app/",
        description: "Free cloud platform for deploying apps and databases",
        icon: "🚂",
      },
      {
        title: "Render",
        url: "https://render.com/",
        description: "Free hosting for web services and static sites",
        icon: "🎨",
      },
      {
        title: "GitHub Pages",
        url: "https://pages.github.com/",
        description: "Free static site hosting directly from GitHub repos",
        icon: "📄",
      },
      {
        title: "Cloudflare Pages",
        url: "https://pages.cloudflare.com/",
        description: "Free static site hosting with global CDN",
        icon: "☁️",
      },
    ],
  },
  {
    title: "databases & backend",
    items: [
      {
        title: "Supabase",
        url: "https://supabase.com/",
        description: "Open source Firebase alternative with PostgreSQL backend",
        icon: "🚀",
      },
      {
        title: "PlanetScale",
        url: "https://planetscale.com/",
        description: "Free MySQL platform with branching capabilities",
        icon: "🪐",
      },
      {
        title: "Neon",
        url: "https://neon.tech/",
        description: "Free PostgreSQL with serverless and branching",
        icon: "⚡",
      },
      {
        title: "MongoDB Atlas",
        url: "https://www.mongodb.com/atlas",
        description: "Free cloud MongoDB hosting",
        icon: "🍃",
      },
      {
        title: "Firebase",
        url: "https://firebase.google.com/",
        description: "Google's mobile and web app development platform",
        icon: "🔥",
      },
      {
        title: "Upstash",
        url: "https://upstash.com/",
        description: "Free Redis and Kafka with per-request pricing",
        icon: "📡",
      },
    ],
  },
  {
    title: "productivity & utilities",
    items: [
      {
        title: "Notion",
        url: "https://www.notion.so/",
        description: "All-in-one workspace for notes and docs",
        icon: "📝",
      },
      {
        title: "Obsidian",
        url: "https://obsidian.md/",
        description: "Free note-taking with linked knowledge graphs",
        icon: "🧠",
      },
      {
        title: "Linear",
        url: "https://linear.app/",
        description: "Modern issue tracking with generous free tier",
        icon: "📊",
      },
      {
        title: "Trello",
        url: "https://trello.com/",
        description: "Free project management with Kanban boards",
        icon: "📋",
      },
      {
        title: "Clockify",
        url: "https://clockify.me/",
        description: "Free time tracking for teams",
        icon: "⏰",
      },
      {
        title: "Loom",
        url: "https://www.loom.com/",
        description: "Free screen recording and video messaging",
        icon: "🎥",
      },
    ],
  },
  {
    title: "api & testing",
    items: [
      {
        title: "Bruno",
        url: "https://www.usebruno.com/",
        description: "Open-source API client, offline-first",
        icon: "🐻",
      },
      {
        title: "Hoppscotch",
        url: "https://hoppscotch.io/",
        description: "Open-source API development ecosystem",
        icon: "🐰",
      },
      {
        title: "Insomnia",
        url: "https://insomnia.rest/",
        description: "Open-source API client and design platform",
        icon: "😴",
      },
      {
        title: "Thunder Client",
        url: "https://www.thunderclient.com/",
        description: "Free VS Code extension for API testing",
        icon: "⚡",
      },
      {
        title: "Postman",
        url: "https://www.postman.com/",
        description: "API platform with generous free tier",
        icon: "📮",
      },
      {
        title: "JSONPlaceholder",
        url: "https://jsonplaceholder.typicode.com/",
        description: "Free fake REST API for testing",
        icon: "🔗",
      },
    ],
  },
  {
    title: "code editors & ides",
    items: [
      {
        title: "VS Code",
        url: "https://code.visualstudio.com/",
        description: "Free, open-source code editor with extensive extensions",
        icon: "💻",
      },
      {
        title: "GitHub",
        url: "https://github.com/",
        description: "Free Git hosting with unlimited public repos",
        icon: "🐙",
      },
      {
        title: "CodeSandbox",
        url: "https://codesandbox.io/",
        description: "Online code editor for web development",
        icon: "📦",
      },
      {
        title: "StackBlitz",
        url: "https://stackblitz.com/",
        description: "Instant dev environments in the browser",
        icon: "⚡",
      },
      {
        title: "Replit",
        url: "https://replit.com/",
        description: "Online coding environment for any language",
        icon: "🔁",
      },
      {
        title: "Gitpod",
        url: "https://www.gitpod.io/",
        description: "Dev environments in the cloud",
        icon: "☁️",
      },
    ],
  },
  {
    title: "frameworks & libraries",
    items: [
      {
        title: "Prisma",
        url: "https://www.prisma.io/",
        description: "Open-source ORM for TypeScript and Node.js",
        icon: "🔷",
      },
      {
        title: "Drizzle ORM",
        url: "https://orm.drizzle.team/",
        description: "Lightweight TypeScript ORM with great DX",
        icon: "🌧️",
      },
      {
        title: "tRPC",
        url: "https://trpc.io/",
        description: "End-to-end typesafe APIs made easy",
        icon: "🔗",
      },
      {
        title: "NextAuth.js",
        url: "https://next-auth.js.org/",
        description: "Complete open-source authentication solution",
        icon: "🔑",
      },
      {
        title: "Framer Motion",
        url: "https://www.framer.com/motion/",
        description: "Open-source motion library for React",
        icon: "🎭",
      },
      {
        title: "Zod",
        url: "https://zod.dev/",
        description: "TypeScript-first schema validation library",
        icon: "🛡️",
      },
    ],
  },
];

// Function to randomly select categories and items
const getRandomBookmarks = (): BookmarkCategory[] => {
  // Shuffle array function
  const shuffleArray = (array: any[]): any[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // Get 3 random categories
  const shuffledCategories = shuffleArray(allBookmarkData);
  const selectedCategories = shuffledCategories.slice(0, 3);

  // For each selected category, randomly pick 2-3 items
  return selectedCategories.map((category) => ({
    ...category,
    items: shuffleArray(category.items).slice(
      0,
      Math.floor(Math.random() * 2) + 2
    ), // 2-3 items
  }));
};

const BookmarkCard: React.FC<{ item: BookmarkItem }> = ({ item }) => {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-[var(--callout-border)]/10 transition-all duration-200 group"
      title={item.description}
    >
      <span className="text-base flex-shrink-0">{item.icon || "🔗"}</span>
      <span className="text-sm text-[var(--text-color)] group-hover:text-[var(--bronzer)] transition-colors duration-200 flex-1">
        {item.title}
      </span>
      <HiExternalLink className="w-3 h-3 text-[var(--text-p)]/30 group-hover:text-[var(--bronzer)] transition-colors duration-200 opacity-0 group-hover:opacity-100" />
    </a>
  );
};

const CategorySection: React.FC<{ category: BookmarkCategory }> = ({
  category,
}) => {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-[var(--text-color)] mb-3 uppercase tracking-wide">
        {category.title}
      </h3>
      <div className="space-y-2">
        {category.items.map((item, index) => (
          <BookmarkCard key={index} item={item} />
        ))}
      </div>
    </div>
  );
};

export default function BookmarksPreview() {
  const [bookmarks, setBookmarks] = useState<BookmarkCategory[]>([]);

  useEffect(() => {
    // Generate random bookmarks on component mount
    setBookmarks(getRandomBookmarks());
  }, []);

  return (
    <div className="space-y-8">
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {bookmarks.map((category, index) => (
          <CategorySection
            key={`${category.title}-${index}`}
            category={category}
          />
        ))}
      </div>

      <div className="text-center pt-6 border-t border-[var(--callout-border)]/20">
        <p className="text-sm text-[var(--text-p)]/70">
          Discover more useful tools, resources, and inspiration
        </p>
      </div>
    </div>
  );
}
