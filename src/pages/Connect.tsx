import { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID as string;
const MCP_URL = `https://${projectRef}.supabase.co/functions/v1/mcp`;

const CopyButton = ({ value }: { value: string }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }}
      className={cn(
        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-background",
        "text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
      )}
      aria-label={copied ? "Copied" : "Copy"}
    >
      {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
    </button>
  );
};

const Step = ({ n, children }: { n: number; children: React.ReactNode }) => (
  <li className="flex gap-3">
    <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-secondary text-[12px] font-medium text-foreground">
      {n}
    </span>
    <div className="text-sm leading-relaxed text-foreground/90">{children}</div>
  </li>
);

const Card = ({
  title,
  href,
  children,
}: {
  title: string;
  href?: string;
  children: React.ReactNode;
}) => (
  <section className="rounded-2xl border border-border bg-card/60 p-5 shadow-elev-sm backdrop-blur-sm sm:p-6">
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      {href && (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          Open <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
    {children}
  </section>
);

const Connect = () => {
  return (
    <div className="container-wide max-w-3xl pb-24">
      <Seo
        title="Connect an AI assistant"
        description="Connect ChatGPT or Claude to this site's MCP server to browse posts, activity, and CV as tools."
        path="/connect"
      />

      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Connect an AI assistant
        </h1>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          This site exposes a small set of read-only tools over MCP so an assistant like ChatGPT or
          Claude can browse posts, activity, and author info on your behalf.
        </p>
      </header>

      <section className="mb-8 rounded-2xl border border-border bg-secondary/40 p-5 sm:p-6">
        <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          MCP server URL
        </div>
        <div className="flex items-center gap-2">
          <code className="flex-1 truncate rounded-md border border-border bg-background px-3 py-2 font-mono text-[13px] text-foreground sm:text-sm">
            {MCP_URL}
          </code>
          <CopyButton value={MCP_URL} />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Paste this URL into your assistant's connector settings. No sign-in required.
        </p>
      </section>

      <div className="grid gap-5 sm:gap-6">
        <Card title="ChatGPT" href="https://chatgpt.com/#settings/Connectors/Advanced">
          <ol className="space-y-3">
            <Step n={1}>
              Open <span className="font-mono text-[12px]">Settings → Connectors → Advanced</span> and
              enable <strong>Developer mode</strong>.
            </Step>
            <Step n={2}>
              In the chat composer, click the <strong>+</strong> menu and turn on{" "}
              <strong>Developer mode</strong>.
            </Step>
            <Step n={3}>
              Click <strong>Add sources</strong>, then <strong>Connect more</strong>.
            </Step>
            <Step n={4}>Give the connector a name and paste the MCP URL above.</Step>
            <Step n={5}>Ask ChatGPT to use the site — for example, "list my recent blog posts".</Step>
          </ol>
        </Card>

        <Card
          title="Claude"
          href="https://claude.ai/customize/connectors?modal=add-custom-connector"
        >
          <ol className="space-y-3">
            <Step n={1}>
              Open <span className="font-mono text-[12px]">Settings → Connectors</span> and choose{" "}
              <strong>Add custom connector</strong>.
            </Step>
            <Step n={2}>Give the connector a name and paste the MCP URL above.</Step>
            <Step n={3}>
              Enable the connector from the chat composer, then ask Claude to use the site.
            </Step>
          </ol>
        </Card>
      </div>

      <p className="mt-8 text-xs text-muted-foreground">
        The assistant will discover the available tools automatically once connected.
      </p>
    </div>
  );
};

export default Connect;
