"use client";

import { useState } from "react";
import SectionHeader from "../components/SectionHeader";
import { HiBookmark } from "react-icons/hi2";

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

const bookmarkData: BookmarkCategory[] = [
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
        title: "Upstash",
        url: "https://upstash.com/",
        description: "Free Redis and Kafka with per-request pricing",
        icon: "📡",
      },
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
        title: "Shadcn/ui",
        url: "https://ui.shadcn.com/",
        description: "Copy-paste React components built with Radix UI",
        icon: "🎨",
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
      {
        title: "Thunder Client",
        url: "https://www.thunderclient.com/",
        description: "Free VS Code extension for API testing",
        icon: "⚡",
      },
      {
        title: "Bruno",
        url: "https://www.usebruno.com/",
        description: "Open-source API client, offline-first",
        icon: "🐻",
      },
      {
        title: "Obsidian",
        url: "https://obsidian.md/",
        description: "Free note-taking with linked knowledge graphs",
        icon: "🧠",
      },
      {
        title: "Excalidraw",
        url: "https://excalidraw.com/",
        description: "Free hand-drawn style diagramming tool",
        icon: "✏️",
      },
      {
        title: "Eraser",
        url: "https://www.eraser.io/",
        description: "Free collaborative diagramming for developers",
        icon: "🗂️",
      },
      {
        title: "Hoppscotch",
        url: "https://hoppscotch.io/",
        description: "Open-source API development ecosystem",
        icon: "🐰",
      },
      {
        title: "DBeaver",
        url: "https://dbeaver.io/",
        description: "Free universal database tool",
        icon: "🗄️",
      },
      {
        title: "Insomnia",
        url: "https://insomnia.rest/",
        description: "Open-source API client and design platform",
        icon: "😴",
      },
      {
        title: "Penpot",
        url: "https://penpot.app/",
        description: "Open-source design and prototyping platform",
        icon: "🎨",
      },
      {
        title: "Linear",
        url: "https://linear.app/",
        description: "Modern issue tracking with generous free tier",
        icon: "📊",
      },
      {
        title: "Notion",
        url: "https://www.notion.so/",
        description: "All-in-one workspace for notes and docs",
        icon: "📝",
      },
      {
        title: "Figma",
        url: "https://www.figma.com/",
        description: "Free collaborative design tool",
        icon: "🎨",
      },
      {
        title: "Canva",
        url: "https://www.canva.com/",
        description: "Free graphic design platform",
        icon: "🖼️",
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
        title: "Surge.sh",
        url: "https://surge.sh/",
        description: "Simple, single-command web publishing",
        icon: "⚡",
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
      {
        title: "Appwrite",
        url: "https://appwrite.io/",
        description: "Open-source backend as a service",
        icon: "🔧",
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
        title: "Penpot",
        url: "https://penpot.app/",
        description: "Open-source design and prototyping platform",
        icon: "✏️",
      },
      {
        title: "Excalidraw",
        url: "https://excalidraw.com/",
        description: "Free hand-drawn style diagramming tool",
        icon: "📝",
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
        title: "Pexels",
        url: "https://www.pexels.com/",
        description: "Free stock photos and videos",
        icon: "🎬",
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
        title: "Fontshare",
        url: "https://www.fontshare.com/",
        description: "Free fonts for commercial use",
        icon: "📝",
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
      {
        title: "Feather Icons",
        url: "https://feathericons.com/",
        description: "Simply beautiful open source icons",
        icon: "🪶",
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
      {
        title: "OBS Studio",
        url: "https://obsproject.com/",
        description: "Free and open source streaming software",
        icon: "📹",
      },
      {
        title: "GIMP",
        url: "https://www.gimp.org/",
        description: "Free and open-source image editor",
        icon: "🖌️",
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
      {
        title: "httpbin",
        url: "https://httpbin.org/",
        description: "HTTP request & response service for testing",
        icon: "🌐",
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
        title: "Shadcn/ui",
        url: "https://ui.shadcn.com/",
        description: "Copy-paste React components built with Radix UI",
        icon: "🎨",
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
      {
        title: "Clerk",
        url: "https://clerk.com/",
        description: "Free authentication with generous limits",
        icon: "🔐",
      },
      {
        title: "NextAuth.js",
        url: "https://next-auth.js.org/",
        description: "Complete open-source authentication solution",
        icon: "🔑",
      },
    ],
  },
  {
    title: "databases & admin",
    items: [
      {
        title: "DBeaver",
        url: "https://dbeaver.io/",
        description: "Free universal database tool",
        icon: "🗄️",
      },
      {
        title: "pgAdmin",
        url: "https://www.pgadmin.org/",
        description: "PostgreSQL administration and development platform",
        icon: "🐘",
      },
      {
        title: "Adminer",
        url: "https://www.adminer.org/",
        description: "Database management tool in a single PHP file",
        icon: "⚙️",
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
    title: "inspiration & portfolios",
    items: [
      {
        title: "Dribbble",
        url: "https://dribbble.com/",
        description: "Design inspiration and portfolio showcase",
        icon: "🏀",
      },
      {
        title: "Awwwards",
        url: "https://www.awwwards.com/",
        description: "Website design inspiration and awards",
        icon: "🏆",
      },
      {
        title: "Behance",
        url: "https://www.behance.net/",
        description: "Creative portfolios and project showcases",
        icon: "🎨",
      },
      {
        title: "UI Movement",
        url: "https://uimovement.com/",
        description: "UI design inspiration and patterns",
        icon: "📱",
      },
      {
        title: "Collect UI",
        url: "https://collectui.com/",
        description: "Daily handpicked UI inspiration",
        icon: "🎯",
      },
      {
        title: "CSS Design Awards",
        url: "https://www.cssdesignawards.com/",
        description: "Website design inspiration and recognition",
        icon: "🥇",
      },
    ],
  },
  {
    title: "books & reading",
    items: [
      {
        title: "Structure and Interpretation of Computer Programs",
        url: "https://mitpress.mit.edu/9780262510875/structure-and-interpretation-of-computer-programs/",
        description:
          "Classic CS textbook that teaches programming fundamentals",
        icon: "📖",
      },
      {
        title: "The Pragmatic Programmer",
        url: "https://pragprog.com/titles/tpp20/the-pragmatic-programmer-20th-anniversary-edition/",
        description: "From journeyman to master - essential programming wisdom",
        icon: "🔧",
      },
      {
        title: "Clean Code",
        url: "https://www.oreilly.com/library/view/clean-code-a/9780136083238/",
        description: "A handbook of agile software craftsmanship",
        icon: "🧹",
      },
      {
        title: "The Design of Everyday Things",
        url: "https://www.basicbooks.com/titles/don-norman/the-design-of-everyday-things/9780465050659/",
        description: "Essential reading for understanding user-centered design",
        icon: "🎨",
      },
      {
        title: "Gödel, Escher, Bach",
        url: "https://www.basicbooks.com/titles/douglas-r-hofstadter/godel-escher-bach/9780465026562/",
        description: "An eternal golden braid exploring consciousness and AI",
        icon: "🧠",
      },
      {
        title: "The Soul of a New Machine",
        url: "https://www.hachettebookgroup.com/titles/tracy-kidder/the-soul-of-a-new-machine/9780316491976/",
        description: "Pulitzer Prize winner about computer engineering culture",
        icon: "⚙️",
      },
      {
        title: "Antifragile",
        url: "https://www.penguinrandomhouse.com/books/176227/antifragile-by-nassim-nicholas-taleb/",
        description:
          "Things that gain from disorder - applicable to systems design",
        icon: "💪",
      },
      {
        title: "The Black Swan",
        url: "https://www.penguinrandomhouse.com/books/175380/the-black-swan-by-nassim-nicholas-taleb/",
        description: "The impact of highly improbable events on technology",
        icon: "🦢",
      },
      {
        title: "Thinking, Fast and Slow",
        url: "https://us.macmillan.com/books/9780374533557",
        description:
          "Understanding cognitive biases crucial for product design",
        icon: "🤔",
      },
      {
        title: "The Innovator's Dilemma",
        url: "https://www.harpercollins.com/products/the-innovators-dilemma-clayton-m-christensen",
        description: "Why great companies fail - essential for tech strategy",
        icon: "🚀",
      },
      {
        title: "Hackers: Heroes of the Computer Revolution",
        url: "https://www.penguinrandomhouse.com/books/154705/hackers-by-steven-levy/",
        description: "The definitive history of computer culture and ethics",
        icon: "💻",
      },
      {
        title: "The Phoenix Project",
        url: "https://itrevolution.com/the-phoenix-project/",
        description: "A novel about IT, DevOps, and helping your business win",
        icon: "🔥",
      },
      {
        title: "Zero to One",
        url: "https://www.penguinrandomhouse.com/books/223624/zero-to-one-by-peter-thiel-with-blake-masters/",
        description: "Notes on startups and building the future",
        icon: "0️⃣",
      },
      {
        title: "The Hard Thing About Hard Things",
        url: "https://www.harpercollins.com/products/the-hard-thing-about-hard-things-ben-horowitz",
        description: "Building a business when there are no easy answers",
        icon: "💎",
      },
      {
        title: "Sapiens",
        url: "https://www.harpercollins.com/products/sapiens-yuval-noah-harari",
        description:
          "A brief history of humankind - perspective on technology's role",
        icon: "🌍",
      },
      {
        title: "The Lean Startup",
        url: "https://www.penguinrandomhouse.com/books/211120/the-lean-startup-by-eric-ries/",
        description: "How today's entrepreneurs use continuous innovation",
        icon: "📈",
      },
      {
        title: "Atomic Habits",
        url: "https://jamesclear.com/atomic-habits",
        description:
          "An easy & proven way to build good habits & break bad ones",
        icon: "⚛️",
      },
      {
        title: "The Art of War",
        url: "https://www.penguinrandomhouse.com/books/620945/the-art-of-war-by-sun-tzu/",
        description: "Ancient strategy that applies to business and tech",
        icon: "⚔️",
      },
      {
        title: "Meditations",
        url: "https://www.penguinrandomhouse.com/books/274522/meditations-by-marcus-aurelius/",
        description: "Stoic philosophy for dealing with complexity and stress",
        icon: "🏛️",
      },
      {
        title: "The Catcher in the Rye",
        url: "https://www.penguinrandomhouse.com/books/5107/the-catcher-in-the-rye-by-j-d-salinger/",
        description:
          "Classic coming-of-age novel that resonates with many developers",
        icon: "🎭",
      },
    ],
  },
  {
    title: "articles",
    items: [
      {
        title: "Write Like You Talk",
        url: "http://www.paulgraham.com/talk.html",
        description: "Paul Graham's essay on natural writing style",
        icon: "💬",
      },
      {
        title: "The Joel Test",
        url: "https://www.joelonsoftware.com/2000/08/09/the-joel-test-12-steps-to-better-code/",
        description: "12 steps to better code by Joel Spolsky",
        icon: "✅",
      },
      {
        title: "No Silver Bullet",
        url: "http://worrydream.com/refs/Brooks-NoSilverBullet.pdf",
        description:
          "Fred Brooks' classic essay on software engineering complexity",
        icon: "🎯",
      },
      {
        title: "How To Ask Questions The Smart Way",
        url: "http://catb.org/~esr/faqs/smart-questions.html",
        description: "Guide to asking effective technical questions",
        icon: "❓",
      },
      {
        title: "The Cathedral and the Bazaar",
        url: "http://catb.org/~esr/writings/cathedral-bazaar/",
        description: "Eric S. Raymond's analysis of open-source development",
        icon: "🏛️",
      },
      {
        title: "Teach Yourself Programming in Ten Years",
        url: "https://norvig.com/21-days.html",
        description: "Peter Norvig on the reality of learning programming",
        icon: "📚",
      },
      {
        title: "The Mythical Man-Month",
        url: "https://en.wikipedia.org/wiki/The_Mythical_Man-Month",
        description: "Classic software engineering essay by Fred Brooks",
        icon: "📖",
      },
      {
        title: "What Every Programmer Should Know About Memory",
        url: "https://people.freebsd.org/~lstewart/articles/cpumemory.pdf",
        description: "Ulrich Drepper's comprehensive guide to memory systems",
        icon: "🧠",
      },
      {
        title: "The Art of Unix Programming",
        url: "http://catb.org/~esr/writings/taoup/html/",
        description: "Eric S. Raymond's philosophy of Unix design",
        icon: "🐧",
      },
      {
        title: "Reflections on Trusting Trust",
        url: "https://users.ece.cmu.edu/~ganger/712.fall02/papers/p761-thompson.pdf",
        description: "Ken Thompson's Turing Award lecture on security",
        icon: "🔐",
      },
      {
        title: "Things You're Allowed to Do",
        url: "https://milan.cvitkovic.net/writing/things_youre_allowed_to_do/",
        description: "Permission to break conventional rules",
        icon: "✅",
      },
      {
        title: "How to Be a Senior Engineer",
        url: "https://staffeng.com/guides/staff-engineer-archetypes/",
        description: "Guide to senior engineering roles and growth",
        icon: "📈",
      },
      {
        title: "The Grug Brained Developer",
        url: "https://grugbrain.dev/",
        description: "A humorous take on software development complexity",
        icon: "🦴",
      },
      {
        title: "Every Company Has the Same Hiring Criteria",
        url: "https://www.tomsherman.me/hiring",
        description: "Insights into tech hiring practices",
        icon: "💼",
      },
      {
        title: "Communication Is the Job",
        url: "https://blog.ceejbot.com/posts/communication-is-the-job/",
        description: "Why communication skills matter in engineering",
        icon: "💬",
      },
    ],
  },
  {
    title: "engineering",
    items: [
      {
        title: "React Documentation",
        url: "https://react.dev/",
        description: "Official React documentation and guides",
        icon: "⚛️",
      },
      {
        title: "MDN Web Docs",
        url: "https://developer.mozilla.org/",
        description: "Comprehensive web development documentation",
        icon: "🌐",
      },
      {
        title: "System Design Primer",
        url: "https://github.com/donnemartin/system-design-primer",
        description: "Learn how to design large-scale systems",
        icon: "⚙️",
      },
      {
        title: "The Twelve-Factor App",
        url: "https://12factor.net/",
        description: "Methodology for building software-as-a-service apps",
        icon: "📋",
      },
      {
        title: "Google Engineering Practices",
        url: "https://google.github.io/eng-practices/",
        description: "Google's code review guidelines and best practices",
        icon: "🔍",
      },
      {
        title: "High Scalability",
        url: "http://highscalability.com/",
        description: "Building bigger, faster, more reliable websites",
        icon: "📈",
      },
      {
        title: "Awesome Lists",
        url: "https://github.com/sindresorhus/awesome",
        description: "Curated lists of awesome software and resources",
        icon: "✨",
      },
      {
        title: "Clean Code JavaScript",
        url: "https://github.com/ryanmcdermott/clean-code-javascript",
        description: "Clean Code concepts adapted for JavaScript",
        icon: "🧹",
      },
      {
        title: "You Don't Know JS",
        url: "https://github.com/getify/You-Dont-Know-JS",
        description: "Deep dive into JavaScript core mechanisms",
        icon: "📖",
      },
      {
        title: "Free Programming Books",
        url: "https://github.com/EbookFoundation/free-programming-books",
        description: "Freely available programming books",
        icon: "📚",
      },
      {
        title: "Papers We Love",
        url: "https://paperswelove.org/",
        description: "Repository of academic computer science papers",
        icon: "📄",
      },
      {
        title: "Architecture Decision Records",
        url: "https://adr.github.io/",
        description: "Documentation of important software decisions",
        icon: "🏗️",
      },
      {
        title: "Go by Example",
        url: "https://gobyexample.com/",
        description: "Hands-on introduction to Go programming",
        icon: "🐹",
      },
      {
        title: "Rust by Example",
        url: "https://doc.rust-lang.org/rust-by-example/",
        description: "Learn Rust with runnable examples",
        icon: "🦀",
      },
      {
        title: "The Missing Semester",
        url: "https://missing.csail.mit.edu/",
        description: "Essential tools and techniques for computer science",
        icon: "🎓",
      },
      {
        title: "Building for the 99% Developers",
        url: "https://future.com/software-development-building-for-99-developers/",
        description: "Making development tools accessible",
        icon: "🛠️",
      },
      {
        title: "Advice for Engineers",
        url: "https://www.spakhm.com/p/advice-for-engineers",
        description: "Career advice from experienced engineers",
        icon: "💡",
      },
    ],
  },
  {
    title: "design",
    items: [
      {
        title: "Dribbble",
        url: "https://dribbble.com/",
        description: "Design inspiration and portfolio showcase",
        icon: "🏀",
      },
      {
        title: "UI Movement",
        url: "https://uimovement.com/",
        description: "UI design inspiration and patterns",
        icon: "📱",
      },
      {
        title: "Coolors",
        url: "https://coolors.co/",
        description: "Color scheme generator and palette tool",
        icon: "🎨",
      },
      {
        title: "Google Fonts",
        url: "https://fonts.google.com/",
        description: "Free web fonts from Google",
        icon: "🔤",
      },
    ],
  },
  {
    title: "music",
    items: [
      {
        title: "Kodaline - All I Want",
        url: "https://www.youtube.com/watch?v=mtf7hC17IBM",
        description: "Emotional indie rock ballad",
        icon: "🎵",
      },
      {
        title: "James Arthur - Impossible",
        url: "https://www.youtube.com/watch?v=BdLi5UUsxxM",
        description: "Powerful vocal performance and emotional depth",
        icon: "🎤",
      },
      {
        title: "Linkin Park - Final Masquerade",
        url: "https://www.youtube.com/watch?v=i8q8fFs3KTM",
        description: "Alternative rock with deep lyrics",
        icon: "🎸",
      },
      {
        title: "Metallica - Nothing Else Matters",
        url: "https://www.youtube.com/watch?v=tAGnKpE4NCI",
        description: "Epic metal ballad with orchestral elements",
        icon: "🤘",
      },
      {
        title: "Tom Petty - Learning to Fly",
        url: "https://www.youtube.com/watch?v=s5BJXwNeKsQ",
        description: "Classic rock anthem about taking chances",
        icon: "🛩️",
      },
      {
        title: "David Bowie - Heroes",
        url: "https://www.youtube.com/watch?v=lXgkuM2NhYI",
        description: "Iconic rock anthem of defiance and love",
        icon: "⚡",
      },
      {
        title: "Pink Floyd - Comfortably Numb",
        url: "https://www.youtube.com/watch?v=_FrOQC-zEog",
        description: "Progressive rock masterpiece with iconic guitar solo",
        icon: "🌙",
      },
      {
        title: "The Beatles - Hey Jude",
        url: "https://www.youtube.com/watch?v=A_MjCqQoLLA",
        description: "Timeless classic with unforgettable melody",
        icon: "🎶",
      },
      {
        title: "Queen - Bohemian Rhapsody",
        url: "https://www.youtube.com/watch?v=fJ9rUzIMcZQ",
        description: "Epic rock opera that changed music forever",
        icon: "👑",
      },
      {
        title: "The Lumineers - Ho Hey",
        url: "https://www.youtube.com/watch?v=zvCBSSwgtg4",
        description: "Folk rock anthem with stomping rhythm",
        icon: "🪕",
      },
      {
        title: "Imagine Dragons - Demons",
        url: "https://www.youtube.com/watch?v=mWRsgZuwf_8",
        description: "Alternative rock with introspective lyrics",
        icon: "🐉",
      },
      {
        title: "Coldplay - Fix You",
        url: "https://www.youtube.com/watch?v=k4V3Mo61fJM",
        description: "Emotional anthem about support and healing",
        icon: "❄️",
      },
      {
        title: "Radiohead - Creep",
        url: "https://www.youtube.com/watch?v=XFkzRNyygfk",
        description: "Alternative rock about alienation and self-doubt",
        icon: "📻",
      },
      {
        title: "Johnny Cash - Hurt",
        url: "https://www.youtube.com/watch?v=8AHCfZTRGiI",
        description: "Haunting cover that redefined the original",
        icon: "🖤",
      },
      {
        title: "Led Zeppelin - Stairway to Heaven",
        url: "https://www.youtube.com/watch?v=QkF3oxziUI4",
        description: "Epic rock journey from acoustic to electric",
        icon: "🪜",
      },
    ],
  },
];

const BookmarkCard: React.FC<{ item: BookmarkItem }> = ({ item }) => {
  const [faviconError, setFaviconError] = useState(false);

  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;
    } catch {
      return null;
    }
  };

  const faviconUrl = getFaviconUrl(item.url);

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between gap-2 p-2 bg-transparent hover:bg-[var(--callout-border)]/10 transition-all duration-200 group rounded-md"
      title={item.description} // Show description on hover
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="w-4 h-4 min-w-[16px] min-h-[16px] flex-shrink-0 flex items-center justify-center">
          {faviconUrl && !faviconError ? (
            <img
              src={faviconUrl}
              alt={`${item.title} favicon`}
              className="w-4 h-4 min-w-[16px] min-h-[16px] object-contain rounded-sm"
              onError={() => setFaviconError(true)}
            />
          ) : (
            <span className="text-xs">{item.icon || "🔗"}</span>
          )}
        </div>
        <span className="text-sm text-[var(--text-color)] group-hover:text-[var(--bronzer)] transition-colors duration-200 truncate">
          {item.title}
        </span>
      </div>
      <span className="text-xs text-[var(--text-p)]/40 hidden sm:block flex-shrink-0">
        {new URL(item.url).hostname}
      </span>
    </a>
  );
};

const CategorySection: React.FC<{ category: BookmarkCategory }> = ({
  category,
}) => {
  return (
    <div className="break-inside-avoid mb-6">
      <h2 className="text-base font-bold text-[var(--text-color)] mb-3">
        {category.title}
      </h2>
      <div className="border-l-4 border-[var(--bronzer)] pl-4">
        <div className="bg-[var(--callout-border)]/5 rounded-lg p-2 space-y-1">
          {category.items.map((item, index) => (
            <BookmarkCard key={index} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default function BookmarksPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = ["all", ...bookmarkData.map((category) => category.title)];

  const filteredBookmarks = bookmarkData
    .filter(
      (category) =>
        selectedCategory === "all" || category.title === selectedCategory
    )
    .map((category) => ({
      ...category,
      items: category.items.filter(
        (item) =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((category) => category.items.length > 0);

  return (
    <div className="min-h-screen py-2">
      <div className="w-full">
        {/* Header */}
        <div className="mb-4">
          {/* Search and Filter */}
          <div className="mt-2 space-y-3">
            <input
              type="text"
              placeholder="Search bookmarks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-transparent border border-[var(--callout-border)] rounded-lg text-[var(--text-color)] placeholder-[var(--text-p)]/60 focus:outline-none focus:border-[var(--bronzer)] transition-colors duration-200 text-sm"
            />

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 text-xs rounded-full transition-all duration-200 ${
                    selectedCategory === category
                      ? "bg-[var(--bronzer)] text-white"
                      : "bg-[var(--callout-border)]/20 text-[var(--text-p)] hover:bg-[var(--callout-border)]/40"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-4 text-sm text-[var(--text-p)]">
          {selectedCategory !== "all" && ` in ${selectedCategory}`}
          {searchTerm && ` matching "${searchTerm}"`}
        </div>

        {/* Bookmarks Masonry Layout */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-0">
          {filteredBookmarks.map((category, index) => (
            <CategorySection key={index} category={category} />
          ))}
        </div>

        {filteredBookmarks.length === 0 && (
          <div className="text-center py-8">
            <p className="text-[var(--text-p)] text-base">
              No bookmarks found matching "{searchTerm}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
