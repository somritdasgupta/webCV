import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LogIn, Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Account sign-in used by the OAuth consent flow.
 *
 * The `next` parameter carries the full consent URL so an unauthenticated
 * visitor lands back on the exact authorization request after signing in.
 * Every method — password, signup, and Google — has to consume it, otherwise
 * the connector round-trips back to `/` and the client silently fails.
 */

/** Only same-origin relative paths are accepted as a post-auth destination. */
const safeNext = (raw: string | null): string => {
  if (!raw) return "/";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
};

export default function AuthSignIn() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const next = useMemo(() => safeNext(params.get("next")), [params]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
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
    setNotice(null);

    if (mode === "signup") {
      const { data, error: err } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth?next=${encodeURIComponent(next)}`,
        },
      });
      setBusy(false);
      if (err) return setError(err.message);
      if (!data.session) {
        return setNotice("Check your email to confirm the account, then sign in.");
      }
      return;
    }

    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (err) setError(err.message);
  };

  return (
    <>
      <Seo title="Sign in" description="Sign in to authorize an application." noindex />
      <main className="container-wide flex min-h-[70vh] items-center justify-center py-24">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card/60 p-6 shadow-elev-md backdrop-blur">
          <div className="mb-5 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-muted-foreground" aria-hidden />
            <h1 className="text-base font-semibold">
              {mode === "signin" ? "Sign in" : "Create an account"}
            </h1>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={busy}
            onClick={withGoogle}
          >
            {busy ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <LogIn className="mr-2 h-4 w-4" aria-hidden />
            )}
            Continue with Google
          </Button>

          <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-widest text-muted-foreground">
            <span className="h-px flex-1 bg-border" aria-hidden />
            or
            <span className="h-px flex-1 bg-border" aria-hidden />
          </div>

          <form onSubmit={withPassword} className="space-y-3">
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
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
              {mode === "signin" ? "Sign in" : "Sign up"}
            </Button>
          </form>

          {error && (
            <p role="alert" className="mt-3 text-xs text-destructive">
              {error}
            </p>
          )}
          {notice && <p className="mt-3 text-xs text-muted-foreground">{notice}</p>}

          <button
            type="button"
            className="mt-4 text-xs text-muted-foreground underline-offset-4 hover:underline"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
              setNotice(null);
            }}
          >
            {mode === "signin"
              ? "Need an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </main>
    </>
  );
}
