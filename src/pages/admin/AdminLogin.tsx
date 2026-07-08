import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ADMIN } from "@/site.config";
import {
  auth,
  fetchUser,
  pollForToken,
  requestDeviceCode,
  type DeviceCode,
  type GhUser,
} from "@/lib/admin/githubAuth";
import { Github, Copy, Check, AlertTriangle, Loader2, ArrowRight, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const AdminLogin = () => {
  const [user, setUser] = useState<GhUser | null>(auth.getCachedUser());
  const [code, setCode] = useState<DeviceCode | null>(null);
  const [status, setStatus] = useState<"idle" | "starting" | "polling" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  // Already signed in? Validate and bounce to editor.
  useEffect(() => {
    const token = auth.getToken();
    if (!token) return;
    fetchUser(token)
      .then((u) => {
        auth.setCachedUser(u);
        setUser(u);
        if (u.login.toLowerCase() === ADMIN.repo.owner.toLowerCase()) {
          navigate("/admin/editor", { replace: true });
        }
      })
      .catch(() => auth.clearToken());
  }, [navigate]);

  const start = async () => {
    setError(null);
    setStatus("starting");
    try {
      const dc = await requestDeviceCode();
      setCode(dc);
      setStatus("polling");
      const token = await pollForToken(dc.device_code, dc.interval);
      auth.setToken(token);
      const u = await fetchUser(token);
      auth.setCachedUser(u);
      setUser(u);
      if (u.login.toLowerCase() !== ADMIN.repo.owner.toLowerCase()) {
        setError(`Signed in as ${u.login}, but only ${ADMIN.repo.owner} can write here.`);
        auth.clearToken();
        setStatus("error");
        return;
      }
      navigate("/admin/editor", { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStatus("error");
    }
  };

  const configMissing = !ADMIN.githubClientId;

  return (
    <div className="relative flex min-h-[calc(100svh-5rem)] items-center justify-center px-4 py-10">
      <div className="relative w-full max-w-md">
        {/* Ambient glow behind the card */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-8 -z-10 rounded-[2rem] bg-gradient-to-br from-accent/20 via-transparent to-primary/10 blur-2xl"
        />

        <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/70 shadow-elev-lg backdrop-blur-xl">
          {/* Header */}
          <div className="flex flex-col items-center gap-3 border-b border-border/60 px-6 py-8 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-background shadow-sm">
              <Shield className="h-5 w-5 text-foreground" />
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Admin · Restricted
            </div>
            <h1 className="font-serif text-3xl leading-none tracking-tight text-foreground sm:text-4xl">
              Sign in
            </h1>
            <p className="max-w-xs text-sm text-muted-foreground">
              GitHub Device Flow — your token stays entirely inside this browser.
            </p>
          </div>

          {/* Body */}
          <div className="px-6 py-6">
            {configMissing && (
              <div className="mb-5 flex gap-3 rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                <div>
                  <strong className="block">Setup needed.</strong>
                  <span className="text-muted-foreground">
                    Add your OAuth Client ID to{" "}
                    <code className="rounded bg-secondary px-1 font-mono text-xs">ADMIN.githubClientId</code>{" "}
                    in <code className="rounded bg-secondary px-1 font-mono text-xs">src/site.config.ts</code>.
                  </span>
                </div>
              </div>
            )}

            {!code && (
              <button
                type="button"
                onClick={start}
                disabled={configMissing || status === "starting"}
                className={cn(
                  "group flex w-full items-center justify-center gap-2.5 rounded-xl bg-foreground px-5 py-3.5 text-sm font-medium text-background shadow-elev-md transition-all duration-300 ease-out-expo",
                  "enabled:hover:-translate-y-0.5 enabled:hover:shadow-elev-lg",
                  "disabled:cursor-not-allowed disabled:opacity-40",
                )}
              >
                {status === "starting" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Github className="h-4 w-4" />
                )}
                Continue with GitHub
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-enabled:group-hover:translate-x-0.5" />
              </button>
            )}

            {code && (
              <div className="space-y-5">
                <div>
                  <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-foreground/10 text-foreground">
                      1
                    </span>
                    Open this URL
                  </div>
                  <a
                    href={code.verification_uri}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 block break-all rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm text-foreground underline-offset-4 transition-colors hover:border-foreground/30 hover:underline"
                  >
                    {code.verification_uri}
                  </a>
                </div>

                <div>
                  <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-foreground/10 text-foreground">
                      2
                    </span>
                    Enter this code
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <code className="flex-1 min-w-0 rounded-xl border border-border bg-background px-4 py-3 text-center font-mono text-2xl tracking-[0.35em] sm:text-3xl">
                      {code.user_code}
                    </code>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(code.user_code);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1500);
                      }}
                      className="inline-flex h-12 items-center gap-1.5 rounded-xl border border-border bg-surface-1 px-4 text-sm transition-all hover:-translate-y-0.5 hover:border-foreground/30"
                    >
                      {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-surface-1/50 px-3 py-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Waiting for authorization — this page redirects automatically.
                </div>
              </div>
            )}

            {error && (
              <p className="mt-5 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                {error}
              </p>
            )}

            {user && user.login.toLowerCase() === ADMIN.repo.owner.toLowerCase() && (
              <p className="mt-5 text-center text-sm text-muted-foreground">
                Signed in as <strong className="text-foreground">{user.login}</strong>. Redirecting…
              </p>
            )}
          </div>

          {/* Footer note */}
          <div className="border-t border-border/60 bg-background/40 px-6 py-3 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Only <span className="text-foreground">{ADMIN.repo.owner}</span> can publish
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
export { AdminLogin };

/** Route guard for /admin/* protected pages. */
export const RequireAdmin = ({ children }: { children: React.ReactNode }) => {
  if (!auth.hasAnySession()) return <Navigate to="/admin" replace />;
  return <>{children}</>;
};
