"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { SandpackTemplate } from "./types/sandpack";
import { cobalt2, dracula } from "@codesandbox/sandpack-themes";

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
    console.error("Error loading files", error);
    return {};
  }
}

interface LiveCodeProps {
  mode: "preview" | "tests" | "console";
  fileNames: string[];
  template: SandpackTemplate;
}

export function LiveCode({ mode, fileNames, template }: LiveCodeProps) {
  const [files, setFiles] = useState<{
    [key: string]: {
      code: string;
      active?: boolean;
      readOnly?: boolean;
      hidden?: boolean;
    };
  }>({});

  useEffect(() => {
    fetchFiles(fileNames).then((fileContents) => {
      const filesConfig = Object.keys(fileContents).reduce((acc, fileName) => {
        acc[fileName] = {
          code: fileContents[fileName],
          active: fileName === fileNames[0],
        };
        return acc;
      }, {} as { [key: string]: { code: string; active?: boolean } });
      setFiles(filesConfig);
    });
  }, [fileNames]);

  return (
    <div className="rounded-lg overflow-hidden border-3 border-blue-700">
      <Sandpack
        theme={cobalt2}
        template={template}
        options={{
          recompileMode: "delayed",
          recompileDelay: 300,
          autorun: true,
          showNavigator: false,
          layout: mode,
          showTabs: true,
          showLineNumbers: true,
          showInlineErrors: true,
          wrapContent: true,
          editorHeight: 320,
        }}
        files={files}
      />
    </div>
  );
}
