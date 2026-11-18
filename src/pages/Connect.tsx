import { useState } from "react";
import { BookOpen, ShieldCheck } from "lucide-react";
import { Seo } from "@/components/Seo";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ConnectionDiagnostics from "@/features/mcp/setup/components/connection-diagnostics";
import InstallOptions from "@/features/mcp/setup/components/install-options";
import type { ConnectionMode } from "@/features/mcp/setup/services/install-config";

const APPROVAL_STEPS = [
  { label: "Preview", detail: "Review the proposed post or edit first." },
  { label: "Approve", detail: "Confirm the request through GitHub when prompted." },
  { label: "Verify", detail: "Your assistant checks the saved result." },
];

export default function Connect() {
  const [mode, setMode] = useState<ConnectionMode>("reader");
  const isOwnerMode = mode === "admin";

  return (
    <div className="w-full min-w-0 px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
      <Seo
        title="MCP connections"
        description="Connect an assistant to read Somrit Dasgupta’s public writing or manage site content with owner approval."
        path="/mcp"
      />

      <div className="mx-auto w-full max-w-5xl min-w-0">
        <header className="border-b border-border/60 pb-8 pt-7 sm:pb-10 sm:pt-10">
          <h1 className="mt-4 max-w-3xl text-balance font-serif text-4xl leading-[1.08] text-foreground sm:text-5xl">
            Bring the site into your assistant.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
            Choose what you need, select your assistant, and follow the short setup below.
          </p>
        </header>

        <div className="min-w-0">
          <section aria-label="Choose MCP access" className="border-b border-border/60 py-7 sm:py-9">
            <div className="grid gap-5 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:items-center md:gap-8">
              <Tabs
                value={mode}
                onValueChange={(value) => setMode(value === "admin" ? "admin" : "reader")}
                className="min-w-0"
              >
                <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-lg bg-muted/70 p-1">
                  <TabsTrigger value="reader" className="h-auto min-h-12 min-w-0 gap-2 rounded-md px-2 py-2.5 text-center text-sm data-[state=active]:shadow-sm sm:px-3">
                    <BookOpen className="h-4 w-4 shrink-0" />
                    <span className="truncate">Read the site</span>
                  </TabsTrigger>
                  <TabsTrigger value="admin" className="h-auto min-h-12 min-w-0 gap-2 rounded-md px-2 py-2.5 text-center text-sm data-[state=active]:shadow-sm sm:px-3">
                    <ShieldCheck className="h-4 w-4 shrink-0" />
                    <span className="truncate">Manage the site</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </section>

          <section aria-label="Install your connection" className="min-w-0 py-7 sm:py-9">
            <div className="rounded-lg border border-border/70 bg-card/70 p-4 sm:p-6 lg:p-8">
              <InstallOptions key={mode} mode={mode} />
            </div>
          </section>

          {isOwnerMode && (
            <section aria-labelledby="approval-heading" className="border-t border-border/60 py-7 sm:py-9">
              <div className="max-w-2xl">
                <p className="font-mono text-[11px] uppercase text-muted-foreground">Owner access</p>
                <h2 id="approval-heading" className="mt-2 text-lg font-medium text-foreground">Changes stay under your control.</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Publishing tools require GitHub approval. Preview every change before authorizing it; never share a session token.
                </p>
              </div>
              <ol className="mt-6 grid gap-0 sm:grid-cols-3 sm:gap-5">
                {APPROVAL_STEPS.map((step, index) => (
                  <li key={step.label} className="grid grid-cols-1 gap-3 border-t border-border/60 py-4 sm:block sm:border-0 sm:py-0">
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-foreground">{step.label}</span>
                      <span className="mt-1 block text-sm leading-5 text-muted-foreground">{step.detail}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <ConnectionDiagnostics />
        </div>
      </div>
    </div>
  );
}