import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Owner sign-in used by the MCP OAuth consent flow.
 *
 * MCP clients speak OAuth 2.1 against the app's authorization server, so this
 * page is the authorization server's login surface — deliberately separate
 * from /admin, which holds a client-side GitHub device-flow token that no MCP
 * client can consume. Google is the primary path because the admin allow-list
 * is keyed on the owner's verified email; the email/password form is only a
 * fallback for the same account.
 *
 * The `next` parameter carries the full consent URL so an unauthenticated
 * visitor lands back on the exact authorization request after signing in.
 */

/** Only same-origin relative paths are accepted as a post-auth destination. */
const safeNext = (raw: string | null): string => {
  if (!raw) return "/";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
};

const GoogleMark = () => (
  <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4" aria-hidden>
    <path
      fill="#4285F4"
      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-8.9Z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24Z"
    />
    <path fill="#FBBC05" d="M5.4 14.4a7.2 7.2 0 0 1 0-4.6V6.7H1.4a12 12 0 0 0 0 10.8l4-3.1Z" />
    <path
      fill="#EA4335"
      d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.4 6.7l4 3.1C6.3 6.9 8.9 4.8 12 4.8Z"
    />
  </svg>
);

export default function AuthSignIn() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const next = useMemo(() => safeNext(params.get("next")), [params]);

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Already signed in (or session hydrates after a provider round-trip)?
  // Send the user straight on to the pending consent request.
  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) navigate(next, { replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate(next, { replace: true });
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate, next]);

  const withGoogle = async () => {
    setBusy(true);
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      // Must be a public same-origin URL; the consent target rides in `next`.
      redirect_uri: `${window.location.origin}/auth?next=${encodeURIComponent(next)}`,
    });
    if (result.error) {
      setError(result.error.message);
      setBusy(false);
      return;
    }
    if (result.redirected) return;
    navigate(next, { replace: true });
  };

  const withPassword = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (err) setError(err.message);
  };

  return (
    <>
      <Seo title="Sign in" description="Sign in to authorize an application." noindex />
      <main className="container-wide flex min-h-[70vh] items-center justify-center py-24">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card/60 p-6 shadow-elev-md backdrop-blur">
          <div className="mb-1 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-muted-foreground" aria-hidden />
            <h1 className="text-base font-semibold">Owner sign-in</h1>
          </div>
          <p className="mb-5 text-xs leading-relaxed text-muted-foreground">
            Authorizes an MCP client to act on this site. Only the site owner's account is
            allowed through.
          </p>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={busy}
            onClick={withGoogle}
          >
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> : <GoogleMark />}
            Continue with Google
          </Button>

          {showPassword ? (
            <form onSubmit={withPassword} className="mt-5 space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
                Sign in
              </Button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setShowPassword(true)}
              className="mt-4 w-full text-center text-[11px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Use email and password instead
            </button>
          )}

          {error && (
            <p role="alert" className="mt-3 text-xs text-red-500">
              {error}
            </p>
          )}
        </div>
      </main>
    </>
  );
}
