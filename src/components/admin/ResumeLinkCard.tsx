import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FileDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { commitFile } from "@/lib/admin/githubCommit";
import { BUNDLED_SETTINGS, SITE_SETTINGS_PATH, isValidResumeUrl, serializeSettings, useSiteSettings } from "@/lib/site-settings";

/** Edits the shared resume link used by social links and /cv. */
export const ResumeLinkCard = ({ token, canPublish }: { token: string | null; canPublish: boolean }) => {
  const queryClient = useQueryClient();
  const { data } = useSiteSettings();
  const current = data?.resumeUrl ?? BUNDLED_SETTINGS.resumeUrl;
  const [value, setValue] = useState(current);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => setValue(current), [current]);

  const isValid = isValidResumeUrl(value.trim());
  const isChanged = value.trim() !== current;

  const save = async () => {
    if (!token || !canPublish || !isValid || !isChanged || isSaving) return;
    setIsSaving(true);
    setStatus(null);
    try {
      const resumeUrl = value.trim();
      await commitFile({ token, path: SITE_SETTINGS_PATH, content: serializeSettings({ resumeUrl }), message: "content: update CV link" });
      queryClient.setQueryData(["site-settings"], { resumeUrl });
      setStatus({ ok: true, text: "Saved. Resume links now open this address." });
    } catch (error) {
      console.error("Resume save failed", { request_id: crypto.randomUUID(), error });
      setStatus({ ok: false, text: error instanceof Error ? error.message : "Could not save the link." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="space-y-2 rounded-lg border border-border/60 p-3">
      <label htmlFor="resume-url" className="flex items-center gap-1.5 font-mono text-[10px] uppercase text-muted-foreground">
        <FileDown className="h-3 w-3" /> CV download link
      </label>
      <input
        id="resume-url"
        type="url"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        aria-invalid={!isValid}
      />
      {!isValid && <p className="text-[11px] text-destructive">Enter a full https:// link.</p>}
      <Button
        type="button"
        onClick={save}
        disabled={!canPublish || !isValid || !isChanged || isSaving}
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-foreground px-2 py-1.5 text-xs font-medium text-background disabled:opacity-40"
      >
        {isSaving && <Loader2 className="h-3 w-3 animate-spin" />} Save link
      </Button>
      {status && <p className={status.ok ? "text-[11px] text-success" : "text-[11px] text-destructive"}>{status.text}</p>}
    </section>
  );
};
