"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { SandpackTemplate } from "./types/sandpack";
import { dracula } from "@codesandbox/sandpack-themes";

const Sandpack = dynamic(
  () => import("@codesandbox/sandpack-react").then((mod) => mod.Sandpack),
  { ssr: false }
);

async function fetchCode(fileName: string) {
  try {
    const response = await fetch(`/api/code-snippets?file=${fileName}`);
    if (!response.ok) throw new Error("Failed to fetch file");
    return await response.text(); // This fetches the exact file... correctly
  } catch (error) {
    console.error(`Error loading file: ${fileName}`, error);
    return "// Error loading file";
  }
}

interface LiveCodeProps {
  mode: "preview" | "tests" | "console";
  fileName: string;
  template: SandpackTemplate;
}

export function LiveCode({ mode, fileName, template }: LiveCodeProps) {
  const [code, setCode] = useState<string | null>(null);

  useEffect(() => {
    fetchCode(fileName).then(setCode);
  }, [fileName]);

  if (code === null) {
    return <div>Loading...</div>;
  }

  return (
    <Sandpack
      theme={dracula}
      template={template}
      options={{
        showNavigator: false,
        layout: mode,
        showTabs: false,
        showLineNumbers: true,
        showInlineErrors: true,
        wrapContent: true,
        editorHeight: 320,
      }}
      files={{
        [fileName]: {
          code: code,
          active: true,
        },
      }}
    />
  );
}
