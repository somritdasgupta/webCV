import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2, ShieldCheck, TriangleAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";

/**
 * OAuth 2.1 consent screen.
 *
 * Supabase Auth is the authorization server; this route is the app-native
 * approve/deny surface it redirects users to. Mounted at
 * `/.lovable/oauth/consent`.
 */

/** The `auth.oauth` namespace is beta and not in the published types yet. */
interface AuthorizationDetails {
  client?: { name?: string; client_id?: string; redirect_uri?: string } | null;
  redirect_url?: string;
  redirect_to?: string;
  scope?: string;
  scopes?: string[];
}
type OAuthApi = {
  getAuthorizationDetails: (
    id: string,
  ) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  approveAuthorization: (
    id: string,
  ) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  denyAuthorization: (
    id: string,
  ) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
};
const oauthApi = () => (supabase.auth as unknown as { oauth: OAuthApi }).oauth;

const SCOPE_LABELS: Record<string, string> = {
  openid: "Confirm your identity",
  email: "Share your email address",
  profile: "Share your basic profile",
};

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";

  const [details, setDetails] = useState<AuthorizationDetails | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) {
        setError("This link is missing an authorization request. Start the connection again from your client.");
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = `/auth?next=${encodeURIComponent(next)}`;
        return;
      }
      setEmail(sess.session.user.email ?? null);

      const { data, error: err } = await oauthApi().getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (err) return setError(err.message);

      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })().catch((e) => active && setError(e instanceof Error ? e.message : String(e)));
    return () => {
      active = false;
    };
  }, [authorizationId]);

  const decide = useCallback(
    async (approve: boolean) => {
      setBusy(true);
      setError(null);
      const api = oauthApi();
      const { data, error: err } = approve
        ? await api.approveAuthorization(authorizationId)
        : await api.denyAuthorization(authorizationId);
      if (err) {
        setBusy(false);
        return setError(err.message);
      }
      const target = data?.redirect_url ?? data?.redirect_to;
      if (!target) {
        setBusy(false);
        return setError("The authorization server did not return a redirect. Try connecting again.");
      }
      window.location.href = target;
    },
    [authorizationId],
  );

  const clientName = details?.client?.name ?? "an application";
  const scopes = details?.scopes ?? (details?.scope ? details.scope.split(/\s+/) : []);

  return (
    <>
      <Seo
        title="Authorize application"
        description="Approve or deny an application requesting access to your account."
        noindex
      />
      <main className="container-wide flex min-h-[70vh] items-center justify-center py-24">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card/60 p-6 shadow-elev-md backdrop-blur">
          {error ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-destructive">
                <TriangleAlert className="h-4 w-4" aria-hidden />
                <h1 className="text-base font-semibold">Authorization failed</h1>
              </div>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          ) : !details ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Loading authorization request…
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-muted-foreground" aria-hidden />
                <h1 className="text-base font-semibold">
                  Connect {clientName} to your account
                </h1>
              </div>

              <p className="text-sm text-muted-foreground">
                {clientName} will be able to call this site's enabled tools while you are
                signed in.
              </p>

              <dl className="mt-5 space-y-3 rounded-xl border border-border/70 bg-surface-1/40 p-4 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Signed in as</dt>
                  <dd className="truncate font-medium">{email ?? "unknown"}</dd>
                </div>
                {details.client?.redirect_uri && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Redirects to</dt>
                    <dd className="truncate font-mono text-xs">
                      {details.client.redirect_uri}
                    </dd>
                  </div>
                )}
              </dl>

              {scopes.length > 0 && (
                <ul className="mt-4 space-y-1.5 text-sm">
                  {scopes.map((s) => (
                    <li key={s} className="text-foreground/90">
                      • {SCOPE_LABELS[s] ?? `Additional permission requested: ${s}`}
                    </li>
                  ))}
                </ul>
              )}

              <p className="mt-4 text-xs text-muted-foreground">
                This does not bypass this site's permissions. Publishing tools remain
                restricted to the owner's admin allow-list.
              </p>

              <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                <Button className="flex-1" disabled={busy} onClick={() => decide(true)}>
                  {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
                  Approve
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  disabled={busy}
                  onClick={() => decide(false)}
                >
                  Cancel connection
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
