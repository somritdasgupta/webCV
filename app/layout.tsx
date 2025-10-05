import "./global.css";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Navbar } from "./components/nav";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics as GAAnalytics } from "./components/Analytics";
import Footer from "./components/footer";
import { baseUrl } from "./lib/constants";
import { SandpackCSS } from "./blog/[slug]/sandpack";
import Script from "next/script";
import AnimatedGrid from "./components/AnimatedGrid";

export const revalidate = 43200;

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Somrit Dasgupta - Engineer x Extraordinaire",
    template: "%s | Somrit Dasgupta",
  },
  description: "Personal website and blog of Somrit Dasgupta",
  openGraph: {
    title: "Somrit Dasgupta - Engineer x Extraordinaire",
    description: "Personal website and blog of Somrit Dasgupta",
    url: baseUrl,
    siteName: "Somrit Dasgupta",
    locale: "en_US",
    type: "website",
    images: [
      {
        type: "image/png",
        width: 630,
        height: 630,
        url: `${baseUrl}/api/og?title=${encodeURIComponent(
          "hey, I'm Somrit 👋"
        )}`,
        alt: "Somrit Dasgupta - Engineer x Extraordinaire",
      },
    ],
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
};

const cx = (...classes: string[]) => classes.filter(Boolean).join(" ");

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cx(
        "text-black bg-transparent dark:text-white dark:bg-transparent",
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=La+Belle+Aurore&display=swap"
        />
        <SandpackCSS />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-4EM6ML5G79"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-4EM6ML5G79', {
              page_title: document.title,
              page_location: window.location.href,
              send_page_view: true
            });
          `}
        </Script>
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-4EM6ML5G79', {
              page_title: document.title,
              page_location: window.location.href,
              send_page_view: true
            });
          `}
        </Script>

        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function getInitialColorMode() {
                  const persistedColorPreference = window.localStorage.getItem('theme');
                  if (persistedColorPreference) {
                    return persistedColorPreference;
                  }
                  const mql = window.matchMedia('(prefers-color-scheme: dark)');
                  return mql.matches ? 'dark' : 'light';
                }
                
                function updateThemeProperties(isDark) {
                  const root = document.documentElement;
                  if (isDark) {
                    root.style.setProperty("--bg-color", "#151217");
                    root.style.setProperty("--text-color", "#fefefe");
                    root.style.setProperty("--text-p", "#a0c0be");
                    root.style.setProperty("--bronzer", "#a78bfa");
                    root.style.setProperty("--callout-bg", "#1f293493");
                    root.style.setProperty("--callout-border", "#322d47");
                    root.style.setProperty("--card-bg", "#1f293493");
                    root.style.setProperty("--nav-pill", "#181120");
                  } else {
                    root.style.setProperty("--bg-color", "#fffbfb");
                    root.style.setProperty("--text-color", "#471919");
                    root.style.setProperty("--text-p", "#6a2a2a");
                    root.style.setProperty("--bronzer", "#2e6754");
                    root.style.setProperty("--callout-bg", "#fbf7f7");
                    root.style.setProperty("--callout-border", "#c8c8c8b3");
                    root.style.setProperty("--card-bg", "#f1f1f1e6");
                    root.style.setProperty("--nav-pill", "#f6f8ff");
                  }
                }
                
                const colorMode = getInitialColorMode();
                const isDark = colorMode === 'dark';
                
                document.documentElement.setAttribute('data-theme', colorMode);
                document.documentElement.style.setProperty('color-scheme', colorMode);
                
                if (isDark) {
                  document.documentElement.classList.add('dark');
                  document.querySelector('meta[name="theme-color"]').setAttribute('content', '#0a0310');
                } else {
                  document.documentElement.classList.remove('dark');
                  document.querySelector('meta[name="theme-color"]').setAttribute('content', '#fffbfb');
                }
                
                // Update CSS custom properties
                updateThemeProperties(isDark);

                window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
                  const newColorMode = e.matches ? 'dark' : 'light';
                  const newIsDark = newColorMode === 'dark';
                  
                  document.documentElement.setAttribute('data-theme', newColorMode);
                  document.documentElement.style.setProperty('color-scheme', newColorMode);
                  
                  if (newIsDark) {
                    document.documentElement.classList.add('dark');
                    document.querySelector('meta[name="theme-color"]').setAttribute('content', '#0a0310');
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.querySelector('meta[name="theme-color"]').setAttribute('content', '#fffbfb');
                  }
                  
                  // Update CSS custom properties for system theme changes
                  updateThemeProperties(newIsDark);
                });
              })();
            `,
          }}
        />

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
                "Personal website and blog of Somrit Dasgupta - a developer, engineer & extraordinaire",
              image: `${baseUrl}/somritdasgupta.jpg`,
              sameAs: [
                "https://www.instagram.com/somritdasgupta",
                "https://www.linkedin.com/in/somritdasgupta",
                "https://github.com/somritdasgupta",
              ],
            }),
          }}
        />

        <Script
          id="website-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              url: baseUrl,
              name: "Somrit Dasgupta - Engineer x Extraordinaire",
              description:
                "Personal website and blog of Somrit Dasgupta - a developer, engineer & extraordinaire.",
              publisher: {
                "@type": "Person",
                name: "Somrit Dasgupta",
              },
            }),
          }}
        />
      </head>
      <body className="antialiased mx-4 mt-2 lg:mx-auto font-sans">
        <AnimatedGrid />
        <main className="max-w-8xl mx-auto w-full flex-auto min-w-0 mt-4 lg:mt-6 flex flex-col px-4 md:px-8 lg:pr-8 xl:pr-12 relative z-10 pb-20 lg:pb-8">
          <Navbar />
          <GAAnalytics />
          <div className="lg:mt-0">{children}</div>
          {/* Footer only shows on mobile since desktop has it integrated in navbar */}
          <div className="lg:hidden mt-16">
            <Footer />
          </div>
          <Analytics />
          <SpeedInsights />
        </main>
      </body>
    </html>
  );
}
