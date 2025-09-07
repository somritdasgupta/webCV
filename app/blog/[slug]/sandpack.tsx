"use client";

import { getSandpackCssText } from "@codesandbox/sandpack-react";
import { useServerInsertedHTML } from "next/navigation";

// Component to inject Sandpack CSS
export function SandpackCSS() {
  useServerInsertedHTML(() => {
    return <style dangerouslySetInnerHTML={{ __html: getSandpackCssText() }} />;
  });
  return null;
}
