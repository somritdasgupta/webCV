"use client";

import { Sandpack } from "@codesandbox/sandpack-react";
import { dracula } from "@codesandbox/sandpack-themes";
import React, { Suspense } from "react";
import dynamic from 'next/dynamic';
import { terminalExample, basicHtml, basicJs } from "./sandpack-files";

// ErrorBoundary using dynamic import for client-side rendering
const ErrorBoundaryComponent = dynamic(() => import('../components/ErrorBoundary'), {
  ssr: false, // Disable server-side rendering for this component
});

export function LiveCode({ mode }: { mode: 'console' | 'html' | 'js' }) {
  let files;
  let layoutMode: 'preview' | 'tests' | 'console' = 'preview';

  if (mode === 'html') {
    files = {
      "/index.html": basicHtml,
    };
  } else if (mode === 'js') {
    files = {
      "/index.js": basicJs,
    };
  } else if (mode === 'console') {
    files = {
      "/Main.java": terminalExample,
    };
    layoutMode = 'console';
  }

  return (
    <Suspense fallback={null}>
      <ErrorBoundaryComponent
        fallback={"Oops, there was an error loading the CodeSandbox."}
      >
        <Sandpack
          theme={dracula}
          files={files}
          options={{
            layout: layoutMode,
            showNavigator: false,
            showLineNumbers: true,
            showTabs: true,
            closableTabs: true,
            editorHeight: 350,
            editorWidthPercentage: 50,
            classes: {
              "sp-wrapper": "custom-wrapper",
              "sp-editor": "custom-editor",
              "sp-preview": "custom-preview",
            },
          }}
        />
      </ErrorBoundaryComponent>
    </Suspense>
  );
}
