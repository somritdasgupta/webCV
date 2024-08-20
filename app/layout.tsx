import "./global.css";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Navbar } from "./components/nav";
import { Analytics } from "@vercel/analytics/react";
import Footer from "./components/footer";
import { baseUrl } from "./sitemap";
import { SandpackCSS } from "./blog/[slug]/sandpack";
import Script from "next/script";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Somrit Dasgupta - Developer and Engineer",
    template: "%s | Somrit Dasgupta",
  },
  description:
    "Personal website and blog of Somrit Dasgupta, a developer and engineer. I hold a bachelor's in computer science & engineering and outside of all technical stuff, I'm a fan of football, specifically an avid Real Madrid fanboy. Also, who doesn't love good jokes and memes?",
  openGraph: {
    title: "Somrit Dasgupta - Developer and Engineer",
    description:
      "Welcome to the personal website of Somrit Dasgupta. Explore projects, blog posts, and insights from an engineer's perspective.",
    url: baseUrl,
    siteName: "Somrit Dasgupta",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${baseUrl}/api/og?title=${encodeURIComponent(
          "hey, I'm Somrit 👋"
        )}`,
        width: 2400,
        height: 1260,
        alt: "Somrit Dasgupta - Developer and Engineer",
      },
    ],
  },
  twitter: {
    title: "Somrit Dasgupta - Developer and Engineer",
    card: "summary_large_image",
    description:
      "The official website of Somrit Dasgupta, featuring projects, blog posts, and insights from an engineer's perspective.",
    images: [
      `${baseUrl}/api/og?title=${encodeURIComponent("hey, I'm Somrit 👋")}`,
    ],
    creator: "@kitsomrit",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "gv-aymi4k24u76uxs.dv.googlehosted.com",
  },
};

const cx = (...classes: string[]) => classes.filter(Boolean).join(" ");

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Determine the theme on the server-side and embed it in the HTML
  const themeScript = `
    (function() {
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const theme = savedTheme || (prefersDark ? 'dark' : 'light');
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.style.setProperty('color-scheme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.querySelector('meta[name="theme-color"]').setAttribute('content', '#0a0310');
      } else {
        document.documentElement.classList.remove('dark');
        document.querySelector('meta[name="theme-color"]').setAttribute('content', '#fffbfb');
      }
    })();
  `;

  return (
    <html
      lang="en"
      className={cx(
        "text-black bg-white dark:text-white dark:bg-black",
        GeistSans.variable,
        GeistMono.variable
      )}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="icon"
          href="/favicon.ico"
          type="image/x-icon"
          sizes="48x48"
        />
        <link rel="icon" href="/favicon.png" type="image/png" sizes="48x48" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <meta name="theme-color" content="#fffbfb" />

        {/* Sandpack CSS for blog */}
        <SandpackCSS />

        {/* Inline script to set the theme before any content is rendered */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />

        {/* Person schema (Somrit) */}
        <Script
          id="person-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Somrit Dasgupta",
              jobTitle: "Software Engineer",
              description:
                "Personal website and blog of Somrit Dasgupta, a developer and engineer. I hold a bachelor's in computer science & engineering and outside of all technical stuff, I'm a fan of football, specifically an avid Real Madrid fanboy. Also, who doesn't love good jokes and memes?",
              url: baseUrl,
              image: `${baseUrl}/somritdasgupta.jpg`,
              sameAs: [
                "https://www.instagram.com/somritdasgupta",
                "https://www.linkedin.com/in/somritdasgupta",
                "https://github.com/somritdasgupta",
              ],
            }),
          }}
        />

        {/* WebSite schema */}
        <Script
          id="website-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              url: baseUrl,
              name: "Somrit Dasgupta - Developer and Engineer",
              description:
                "Personal website and blog of Somrit Dasgupta, a developer and engineer. I hold a bachelor's in computer science & engineering and outside of all technical stuff, I'm a fan of football, specifically an avid Real Madrid fanboy. Also, who doesn't love good jokes and memes?",
              publisher: {
                "@type": "Person",
                name: "Somrit Dasgupta",
              },
            }),
          }}
        />
      </head>
      <body className="antialiased mx-4 mt-8 lg:mx-auto font-sans bg-white dark:bg-black">
        <main className="max-w-4xl mx-auto flex-auto min-w-0 mt-6 flex flex-col px-2 md:px-4">
          <Navbar />
          {children}
          <Footer />
          <Analytics />
        </main>
      </body>
    </html>
  );
}
