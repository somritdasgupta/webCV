import { Sandpack, SandpackPredefinedTemplate } from "@codesandbox/sandpack-react";
import { useEffect, useState } from "react";

interface LiveCodeProps {
  template?: SandpackPredefinedTemplate;
  files?: Record<string, string>;
  dependencies?: Record<string, string>;
  title?: string;
  showConsole?: boolean;
}

/**
 * Interactive code playground (powered by Sandpack).
 * Auto-themes with the site theme.
 */
export const LiveCode = ({
  template = "react",
  files,
  dependencies,
  title,
  showConsole = false,
}: LiveCodeProps) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const update = () => setIsDark(document.documentElement.classList.contains("dark"));
    update();
    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  return (
    <figure className="my-8 overflow-hidden rounded-lg border border-border">
      {title && (
        <div className="border-b border-border bg-surface-2 px-4 py-2 font-mono text-xs text-muted-foreground">
          {title}
        </div>
      )}
      <Sandpack
        template={template}
        theme={isDark ? "dark" : "light"}
        files={files}
        customSetup={{ dependencies }}
        options={{
          showLineNumbers: true,
          showInlineErrors: true,
          editorHeight: 380,
          showConsole,
          wrapContent: true,
        }}
      />
    </figure>
  );
};
