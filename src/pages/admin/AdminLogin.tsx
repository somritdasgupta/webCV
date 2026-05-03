import { useEffect, useRef, useState } from "react";
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
import { Github, Copy, Check, AlertTriangle, Loader2, ArrowRight, Shield, KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";

const AdminLogin = () => {
  const [user, setUser] = useState<GhUser | null>(auth.getCachedUser());
  const [code, setCode] = useState<DeviceCode | null>(null);
  const [status, setStatus] = useState<"idle" | "starting" | "polling" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pin, setPin] = useState<string[]>(["", "", "", ""]);
  const [pinError, setPinError] = useState<string | null>(null);
  const pinRefs = useRef<Array<HTMLInputElement | null>>([]);
  const navigate = useNavigate();

  // Already signed in? Validate and bounce to editor.
  useEffect(() => {
    const token = auth.getToken();
    if (!token) {
      // Already in a local dev session? Bounce to editor.
      if (auth.isDevSession()) navigate("/admin/editor", { replace: true });
      return;
    }
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

  const submitPin = (next: string[]) => {
    const value = next.join("");
    if (value.length !== 4) return;
    if (value === ADMIN.devPin) {
      setPinError(null);
      auth.setDevSession(true);
      navigate("/admin/editor", { replace: true });
    } else {
      setPinError("Wrong PIN. Try again.");
      setPin(["", "", "", ""]);
      pinRefs.current[0]?.focus();
    }
  };

  const handlePinChange = (i: number, raw: string) => {
    const v = raw.replace(/\D/g, "").slice(0, 1);
    const next = [...pin];
    next[i] = v;
    setPin(next);
    setPinError(null);
    if (v && i < 3) pinRefs.current[i + 1]?.focus();
    if (next.every((c) => c.length === 1)) submitPin(next);
  };

  const handlePinKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !pin[i] && i > 0) {
      pinRefs.current[i - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && i > 0) pinRefs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < 3) pinRefs.current[i + 1]?.focus();
  };

  const handlePinPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text").trim();
    // Accept either raw 4-digit pin or full "user:pin" form
    const m = text.match(/(?:^|:)(\d{4})$/);
    const digits = (m ? m[1] : text.replace(/\D/g, "")).slice(0, 4);
    if (digits.length === 4) {
      e.preventDefault();
      const next = digits.split("");
      setPin(next);
      submitPin(next);
    }
  };

  return (
    <div className="relative">
      {/* Site-wide ambient smoke shows through — no extra gradient layer here,
          which would clash with the navbar pill backdrop.
          Height: fill the viewport below the floating nav (5rem top pad on
          <main>) so the page sits flush without a scrollbar. */}
      <section className="container-prose relative z-10 flex min-h-[calc(100svh-5rem)] flex-col justify-center py-6 sm:py-10">
        {/* Brand mark */}
        <div className="mb-5 flex items-center gap-2 text-xs font-mono uppercase tracking-[0.3em] text-muted-foreground">
          <Shield className="h-3.5 w-3.5" />
          admin
        </div>

        <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">
          Sign in.
        </h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground sm:text-base">
          GitHub Device Flow. Token stays in your browser.
        </p>

        {configMissing && (
          <div className="mt-8 flex gap-3 rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm">
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

        {/* Primary CTA */}
        {!code && (
          <div className="mt-6">
            <button
              type="button"
              onClick={start}
              disabled={configMissing || status === "starting"}
              className={cn(
                "group inline-flex items-center gap-2.5 rounded-xl bg-foreground px-5 py-3 text-sm font-medium text-background shadow-elev-md transition-all duration-300 ease-out-expo",
                "enabled:hover:-translate-y-0.5 enabled:hover:shadow-elev-lg",
                "disabled:opacity-40 disabled:cursor-not-allowed",
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
          </div>
        )}

        {/* Device code panel */}
        {code && (
          <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-card shadow-elev-md">
            {/* Step 1 */}
            <div className="border-b border-border p-5 sm:p-6">
              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-foreground/10 text-foreground">
                  1
                </span>
                Open this URL
              </div>
              <a
                href={code.verification_uri}
                target="_blank"
                rel="noreferrer"
                className="mt-2 block break-all font-mono text-sm text-foreground underline-offset-4 hover:underline"
              >
                {code.verification_uri}
              </a>
            </div>

            {/* Step 2 */}
            <div className="p-5 sm:p-6">
              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-foreground/10 text-foreground">
                  2
                </span>
                Enter this code
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <code className="flex-1 min-w-0 rounded-xl border border-border bg-background px-4 py-3 text-center font-mono text-2xl tracking-[0.4em] sm:text-3xl">
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

              <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Waiting for authorization… this page redirects automatically.
              </div>
            </div>
          </div>
        )}

        {error && (
          <p className="mt-6 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}

        {user && user.login.toLowerCase() === ADMIN.repo.owner.toLowerCase() && (
          <p className="mt-6 text-sm text-muted-foreground">
            Signed in as <strong className="text-foreground">{user.login}</strong>. Going to editor…
          </p>
        )}

        {/* Backup local PIN — UI access only, no commit privileges */}
        <div className="mt-8 border-t border-border pt-6">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            <KeyRound className="h-3.5 w-3.5" /> or use local PIN
          </div>
          <p className="mt-2 max-w-md text-xs text-muted-foreground">
            Read-only workdesk access for dev / preview. Pushing changes still requires GitHub sign-in above.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="font-mono text-sm text-muted-foreground">{ADMIN.devUsername}:</span>
            <div className="flex items-center gap-2">
              {[0, 1, 2, 3].map((i) => (
                <input
                  key={i}
                  ref={(el) => (pinRefs.current[i] = el)}
                  type="password"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={1}
                  value={pin[i]}
                  onChange={(e) => handlePinChange(i, e.target.value)}
                  onKeyDown={(e) => handlePinKeyDown(i, e)}
                  onPaste={handlePinPaste}
                  aria-label={`PIN digit ${i + 1}`}
                  className={cn(
                    "h-12 w-10 rounded-lg border bg-background text-center font-mono text-lg outline-none transition-colors sm:h-14 sm:w-12 sm:text-xl",
                    pinError ? "border-destructive/60" : "border-border focus:border-foreground/40",
                  )}
                />
              ))}
            </div>
          </div>
          {pinError && (
            <p className="mt-3 text-xs text-destructive">{pinError}</p>
          )}
        </div>
      </section>
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
