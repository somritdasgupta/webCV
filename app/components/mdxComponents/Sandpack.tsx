"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { SandpackTemplate } from "./types/sandpack";
import BoxLoader from "../BoxLoader";
import { motion, AnimatePresence } from "framer-motion";

const Sandpack = dynamic(
  () => import("@codesandbox/sandpack-react").then((mod) => mod.Sandpack),
  { ssr: false }
);

async function fetchFiles(
  fileNames: string[]
): Promise<{ [key: string]: string }> {
  try {
    const response = await fetch(
      `/api/code-snippets?files=${fileNames.join(",")}`
    );
    if (!response.ok) throw new Error("Failed to fetch files");
    return await response.json();
  } catch (error) {
    return {};
  }
}

// Template configurations for different tech stacks
const getTailwindCSS = () => `/* Tailwind CSS - Essential Classes */
*, ::before, ::after {
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
}

* {
  box-sizing: border-box;
  margin: 0;
}

body {
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
}

/* Layout */
.flex { display: flex; }
.flex-col { flex-direction: column; }
.flex-1 { flex: 1 1 0%; }
.flex-shrink-0 { flex-shrink: 0; }
.flex-row-reverse { flex-direction: row-reverse; }
.items-center { align-items: center; }
.items-start { align-items: flex-start; }
.justify-center { justify-content: center; }
.gap-3 { gap: 0.75rem; }
.space-x-2 > :not([hidden]) ~ :not([hidden]) { --tw-space-x-reverse: 0; margin-right: calc(0.5rem * var(--tw-space-x-reverse)); margin-left: calc(0.5rem * calc(1 - var(--tw-space-x-reverse))); }
.space-y-6 > :not([hidden]) ~ :not([hidden]) { --tw-space-y-reverse: 0; margin-top: calc(1.5rem * calc(1 - var(--tw-space-y-reverse))); margin-bottom: calc(1.5rem * var(--tw-space-y-reverse)); }

/* Sizing */
.w-2 { width: 0.5rem; }
.w-5 { width: 1.25rem; }
.w-8 { width: 2rem; }
.h-2 { height: 0.5rem; }
.h-5 { height: 1.25rem; }
.h-8 { height: 2rem; }
.h-screen { height: 100vh; }
.max-w-xs { max-width: 20rem; }
.max-w-md { max-width: 28rem; }

/* Borders & Radius */
.overflow-hidden { overflow: hidden; }
.overflow-y-auto { overflow-y: auto; }
.rounded-full { border-radius: 9999px; }
.rounded-lg { border-radius: 0.5rem; }
.rounded-bl-none { border-bottom-left-radius: 0px; }
.rounded-br-none { border-bottom-right-radius: 0px; }
.border-b { border-bottom-width: 1px; }
.border-t { border-top-width: 1px; }
.border-gray-200 { border-color: rgb(229 231 235); }

/* Backgrounds */
.bg-white { background-color: rgb(255 255 255); }
.bg-gray-100 { background-color: rgb(243 244 246); }
.bg-gray-200 { background-color: rgb(229 231 235); }
.bg-gray-400 { background-color: rgb(156 163 175); }
.bg-gray-700 { background-color: rgb(55 65 81); }
.bg-blue-600 { background-color: rgb(37 99 235); }
.bg-indigo-500 { background-color: rgb(99 102 241); }
.bg-transparent { background-color: transparent; }

/* Padding & Margins */
.p-2 { padding: 0.5rem; }
.p-3 { padding: 0.75rem; }
.p-4 { padding: 1rem; }
.px-4 { padding-left: 1rem; padding-right: 1rem; }
.py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }

/* Text */
.text-center { text-align: center; }
.text-sm { font-size: 0.875rem; line-height: 1.25rem; }
.text-xl { font-size: 1.25rem; line-height: 1.75rem; }
.font-bold { font-weight: 700; }
.font-sans { font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
.text-white { color: rgb(255 255 255); }
.text-gray-500 { color: rgb(107 114 128); }
.text-gray-800 { color: rgb(31 41 55); }

/* Interactions */
.transition-colors { transition-property: color, background-color, border-color; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
.hover\\:bg-blue-700:hover { background-color: rgb(29 78 216); }
.focus\\:outline-none:focus { outline: 2px solid transparent; outline-offset: 2px; }
.focus\\:ring-2:focus { --tw-ring-shadow: 0 0 0 2px rgb(59 130 246 / 0.5); box-shadow: var(--tw-ring-shadow); }
.focus\\:ring-blue-500:focus { --tw-ring-color: rgb(59 130 246); }
.focus\\:ring-opacity-50:focus { --tw-ring-opacity: 0.5; }
.disabled\\:bg-gray-400:disabled { background-color: rgb(156 163 175); }
.disabled\\:cursor-not-allowed:disabled { cursor: not-allowed; }

/* Animation */
.animate-bounce { animation: bounce 1s infinite; }

@keyframes bounce {
  0%, 100% {
    transform: translateY(-25%);
    animation-timing-function: cubic-bezier(0.8,0,1,1);
  }
  50% {
    transform: none;
    animation-timing-function: cubic-bezier(0,0,0.2,1);
  }
}

/* Animation delays */
.\\[animation-delay\\:-0\\.3s\\] { animation-delay: -0.3s; }
.\\[animation-delay\\:-0\\.15s\\] { animation-delay: -0.15s; }

/* Media queries */
@media (min-width: 768px) {
  .md\\:max-w-md { max-width: 28rem; }
}`;

const getTemplateConfig = (template: SandpackTemplate) => {
  const configs = {
    react: {
      mainFile: "/App.js",
      entryFile: "/index.js",
      entryContent: `import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);`,
      cssFile: "/index.css",
      cssContent: `${getTailwindCSS()}

#root {
  height: 100vh;
  width: 100vw;
  isolation: isolate;
}`,
      dependencies: {
        react: "^18.2.0",
        "react-dom": "^18.2.0",
      },
    },
    vue: {
      mainFile: "/src/App.vue",
      entryFile: "/src/main.js",
      entryContent: `import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

createApp(App).mount('#app')`,
      cssFile: "/src/style.css",
      cssContent: `${getTailwindCSS()}

#app {
  height: 100vh;
  width: 100vw;
}`,
      dependencies: {
        vue: "^3.3.0",
      },
    },
    vanilla: {
      mainFile: "/index.js",
      entryFile: "/index.js",
      entryContent: null, // Will use the original file content
      cssFile: "/style.css",
      cssContent: `${getTailwindCSS()}

body {
  height: 100vh;
  width: 100vw;
}`,
      dependencies: {},
    },
    angular: {
      mainFile: "/src/app/app.component.ts",
      entryFile: "/src/main.ts",
      entryContent: `import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent).catch(err => console.error(err));`,
      cssFile: "/src/styles.css",
      cssContent: `${getTailwindCSS()}

html, body {
  height: 100%;
  margin: 0;
  padding: 0;
}`,
      dependencies: {
        "@angular/core": "^17.0.0",
        "@angular/platform-browser": "^17.0.0",
        "@angular/platform-browser-dynamic": "^17.0.0",
        "@angular/common": "^17.0.0",
        rxjs: "^7.5.0",
        tslib: "^2.3.0",
        "zone.js": "^0.14.0",
      },
    },
    svelte: {
      mainFile: "/App.svelte",
      entryFile: "/main.js",
      entryContent: `import App from './App.svelte';
import './app.css';

const app = new App({
  target: document.getElementById('app')
});

export default app;`,
      cssFile: "/app.css",
      cssContent: `${getTailwindCSS()}

#app {
  height: 100vh;
  width: 100vw;
}`,
      dependencies: {},
    },
  };

  return configs[template] || configs.vanilla;
};

interface LiveCodeProps {
  mode: "preview" | "tests" | "console";
  fileNames?: string[];
  template: SandpackTemplate;
  dependencies?: Record<string, string>;
}

export function LiveCode({
  mode,
  fileNames = [],
  template,
  dependencies = {},
}: LiveCodeProps) {
  const [files, setFiles] = useState<{
    [key: string]: {
      code: string;
      active?: boolean;
      readOnly?: boolean;
      hidden?: boolean;
    };
  }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    if (isFullscreen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isFullscreen]);

  useEffect(() => {
    // Early return if no fileNames provided
    if (!fileNames || fileNames.length === 0) {
      console.warn("LiveCode: No fileNames provided");
      setError("No files specified for sandbox");
      setLoading(false);
      return;
    }

    // Reset states
    setLoading(true);
    setError(null);

    console.log(
      "LiveCode: Fetching files:",
      fileNames,
      "for template:",
      template
    );

    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading) {
        setError("Timeout: Failed to load sandbox files");
        setLoading(false);
      }
    }, 10000); // 10 second timeout

    fetchFiles(fileNames)
      .then((fileContents) => {
        clearTimeout(timeout);

        if (Object.keys(fileContents).length === 0) {
          setError("Failed to fetch any files");
          setLoading(false);
          return;
        }

        console.log(
          "LiveCode: Files fetched successfully:",
          Object.keys(fileContents)
        );

        const config = getTemplateConfig(template);
        const filesConfig: {
          [key: string]: { code: string; active?: boolean; hidden?: boolean };
        } = {};

        // Process each fetched file
        Object.keys(fileContents).forEach((fileName, index) => {
          const fileContent = fileContents[fileName];

          // Determine the target file path based on template
          let targetPath: string;
          const hasMultipleFiles = fileNames && fileNames.length > 1;

          if (template === "react") {
            // For React, map to App.js or use original filename if multiple files
            targetPath = hasMultipleFiles ? `/${fileName}` : config.mainFile;
          } else if (template === "vue") {
            // For Vue, map to App.vue or use original filename
            targetPath = hasMultipleFiles
              ? `/src/${fileName}`
              : config.mainFile;
          } else if (template === "svelte") {
            // For Svelte, map to App.svelte or use original filename
            targetPath = hasMultipleFiles ? `/${fileName}` : config.mainFile;
          } else if (template === "angular") {
            // For Angular, map to component file
            targetPath = hasMultipleFiles
              ? `/src/app/${fileName}`
              : config.mainFile;
          } else {
            // For vanilla or other templates, use original filename
            targetPath = `/${fileName}`;
          }

          filesConfig[targetPath] = {
            code: fileContent,
            active: index === 0,
          };
        });

        // Add template-specific entry file if needed
        if (config.entryContent && config.entryFile !== config.mainFile) {
          filesConfig[config.entryFile] = {
            code: config.entryContent,
            active: false,
            hidden: false,
          };
        }

        // Add CSS file for styling
        if (config.cssFile) {
          filesConfig[config.cssFile] = {
            code: config.cssContent,
            active: false,
            hidden: false,
          };
        }

        console.log("LiveCode: Final files config:", Object.keys(filesConfig));
        setFiles(filesConfig);
        setLoading(false);
      })
      .catch((err) => {
        clearTimeout(timeout);
        console.error("LiveCode: Error fetching files:", err);
        setError("Failed to load sandbox files");
        setLoading(false);
      });

    return () => clearTimeout(timeout);
  }, [fileNames, template]);

  const config = getTemplateConfig(template || "vanilla");
  const allDependencies = { ...config.dependencies, ...dependencies };

  // Show error state
  if (error) {
    return (
      <div className="my-8 rounded-xl border border-red-300 bg-red-50 backdrop-blur-sm">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="text-red-600 font-medium mb-2">Sandbox Error</div>
            <div className="text-red-500 text-sm">{error}</div>
            <div className="text-red-400 text-xs mt-2">
              Template: {template}, Files: {fileNames?.join(", ") || "none"}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading || Object.keys(files).length === 0) {
    return (
      <div className="my-8 rounded-xl border border-[var(--code-border)] bg-[var(--card-bg)] backdrop-blur-sm">
        <div className="flex items-center justify-center p-8">
          <BoxLoader size="md" />
        </div>
      </div>
    );
  }

  const sandpackContent = (
    <div
      className={`${isFullscreen ? "h-full bg-[var(--bg-color)]" : "rounded-xl border border-[var(--code-border)] bg-[var(--card-bg)] backdrop-blur-sm transition-all duration-300 hover:border-[var(--bronzer)] hover:shadow-lg"}`}
    >
      {/* Custom Header */}
      <div
        className={`flex items-center justify-between border-b border-[var(--code-border)] bg-[var(--header-bg-color)] px-4 py-3 ${isFullscreen ? "" : "rounded-t-xl"}`}
      >
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="text-sm font-medium text-[var(--text-color)] flex items-center gap-2">
            <svg
              className="w-4 h-4 text-[var(--bronzer)]"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
            Interactive Demo
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-1 rounded-full bg-[var(--bronzer)] text-white font-medium">
            {template.charAt(0).toUpperCase() + template.slice(1)}
          </span>
          <div className="text-xs text-[var(--text-p)] hidden sm:block">
            Live Preview
          </div>
          <button
            onClick={toggleFullscreen}
            className="ml-2 p-1.5 rounded-md hover:bg-[var(--nav-pill)] transition-colors duration-200 text-[var(--text-p)] hover:text-[var(--bronzer)]"
            title={isFullscreen ? "Exit fullscreen (ESC)" : "Enter fullscreen"}
          >
            {isFullscreen ? (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Sandpack Container */}
      <div className={`relative ${isFullscreen ? "h-full" : ""}`}>
        <Sandpack
          theme={{
            colors: {
              surface1: "var(--bg-color)",
              surface2: "var(--card-bg)",
              surface3: "var(--header-bg-color)",
              disabled: "var(--pill-color)",
              base: "var(--text-color)",
              clickable: "var(--text-color)",
              hover: "var(--bronzer)",
              accent: "var(--bronzer)",
              error: "#f87171",
              errorSurface: "#fef2f2",
              warning: "#fbbf24",
              warningSurface: "#fffbeb",
            },
            syntax: {
              plain: "var(--text-color)",
              comment: {
                color: "var(--sh-comment)",
                fontStyle: "italic",
              },
              keyword: "var(--sh-keyword)",
              tag: "var(--bronzer)",
              punctuation: "var(--sh-sign)",
              definition: "var(--sh-identifier)",
              property: "var(--sh-property)",
              static: "var(--sh-class)",
              string: "var(--sh-string)",
            },
            font: {
              body: 'var(--font-geist-sans), system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              mono: 'var(--font-geist-mono), "SF Mono", Monaco, Inconsolata, "Roboto Mono", Consolas, "Droid Sans Mono", monospace',
              size: "14px",
              lineHeight: "1.6",
            },
          }}
          template={template}
          options={{
            recompileMode: "delayed",
            recompileDelay: 300,
            autorun: true,
            showNavigator: false,
            layout: mode,
            showTabs: (fileNames && fileNames.length > 1) || mode === "console",
            showLineNumbers: true,
            showInlineErrors: true,
            wrapContent: true,
            editorHeight: isFullscreen ? "calc(100vh - 60px)" : 380,
            editorWidthPercentage: mode === "preview" ? 55 : 100,
            showConsole: mode === "console",
            showConsoleButton: false,
            showRefreshButton: false,
            bundlerURL: undefined,
            startRoute: "/",
            skipEval: false,
            classes: {
              "sp-wrapper": `!border-0 !rounded-none ${isFullscreen ? "!h-full !m-0 !p-0" : ""}`,
              "sp-layout": `!border-0 !rounded-none ${isFullscreen ? "!h-full !m-0" : ""}`,
              "sp-tab-button":
                "!text-[var(--text-p)] !bg-transparent hover:!text-[var(--text-color)] hover:!bg-[var(--nav-pill)]",
              "sp-tab-button-active":
                "!text-[var(--bronzer)] !bg-[var(--nav-pill)]",
              "sp-code-editor":
                "!bg-[var(--bg-color)] !border-r !border-[var(--code-border)]",
              "sp-preview-container": "!bg-[var(--bg-color)]",
              "sp-preview-iframe":
                "!bg-white !rounded-lg !border !border-[var(--code-border)] !shadow-sm",
              "sp-stack": "!bg-[var(--card-bg)]",
            },
          }}
          files={files}
          customSetup={{
            dependencies: allDependencies,
          }}
        />

        {/* Overlay for better integration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--bronzer)] to-transparent opacity-30"></div>
        </div>
      </div>

      {/* Custom Footer */}
      <div className="border-t border-[var(--code-border)] bg-[var(--header-bg-color)] px-4 py-2 rounded-b-xl">
        <div className="flex items-center justify-between text-xs text-[var(--text-p)]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              Ready
            </span>
            <span>Files: {Object.keys(files).length}</span>
            {isFullscreen && (
              <span className="text-[var(--bronzer)] font-medium">
                Press ESC to exit fullscreen
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline">Powered by Sandpack</span>
            <svg
              className="w-3 h-3 text-[var(--bronzer)]"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {!isFullscreen && <div className="my-8">{sandpackContent}</div>}

      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-[var(--bg-color)] flex items-center justify-center"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsFullscreen(false);
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full"
              onClick={(e) => e.stopPropagation()}
            >
              {sandpackContent}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
