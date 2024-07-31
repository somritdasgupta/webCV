"use client";

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { dracula } from "@codesandbox/sandpack-themes";
import { javaCode, htmlCode, jsCode, pythonCode, cssCode } from "./sandpack-files";

// Dynamic import of Sandpack for client-side rendering
const Sandpack = dynamic(() => import('@codesandbox/sandpack-react').then(mod => mod.Sandpack), { ssr: false });

interface LiveCodeProps {
  mode: 'preview' | 'tests' | 'console';
  fileType: 'java' | 'html' | 'js' | 'python' | 'css';
}

export function LiveCode({ mode, fileType }: LiveCodeProps) {
  let files: { [key: string]: { code: string; active?: boolean } } = {};

  switch (fileType) {
    case 'html':
      files = {
        "/index.html": { code: htmlCode, active: true },
      };
      break;
    case 'js':
      files = {
        "/index.js": { code: jsCode, active: true },
      };
      break;
    case 'java':
      files = {
        "/Main.java": { code: javaCode, active: true },
      };
      break;
    case 'python':
      files = {
        "/script.py": { code: pythonCode, active: true },
      };
      break;
    case 'css':
      files = {
        "/styles.css": { code: cssCode, active: true },
      };
      break;
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Sandpack
        theme={dracula}
        files={files}
        options={{
          autorun:true,
          layout: mode,
          showNavigator: true,
          showLineNumbers: true,
          showTabs: true,
          closableTabs: true,
          editorHeight: 300,
          editorWidthPercentage: 50,
        }}
      />
    </Suspense>
  );
}
