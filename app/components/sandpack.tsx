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
    <div className="rounded-lg overflow-hidden border-3 border-gray-700">
      <Sandpack
        theme={{
          colors: {
            surface1: "#191919",
            surface2: "border-gray-700",
            surface3: "#44475a",
            clickable: "#6272a4",
            base: "#f8f8f2",
            disabled: "#6272a4",
            hover: "#f8f8f2",
            accent: "#bd93f9",
            error: "#f8f8f2",
            errorSurface: "#44475a",
          },
          syntax: {
            plain: "#f8f8f2",
            comment: {
              color: "#6272a4",
              fontStyle: "italic",
            },
            keyword: "#ff79c6",
            tag: "#ff79c6",
            punctuation: "#ff79c6",
            definition: "#f8f8f2",
            property: "#50fa7b",
            static: "#bd93f9",
            string: "#f1fa8c",
          },
          font: {
            body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
            mono: '"Fira Mono", "DejaVu Sans Mono", Menlo, Consolas, "Liberation Mono", Monaco, "Lucida Console", monospace',
            size: "11px",
            lineHeight: "18px",
          },
        }}
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
