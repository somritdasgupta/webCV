"use client";

import { getSandpackCssText } from "@codesandbox/sandpack-react";
import { useServerInsertedHTML } from "next/navigation";

// Component to inject Sandpack CSS
export function SandpackCSS() {
  useServerInsertedHTML(() => {
    const sandpackCss = getSandpackCssText();
    return (
      <style
        dangerouslySetInnerHTML={{ __html: `${sandpackCss}` }}
        id="sandpack"
      />
    );
  });
  return null;
}
