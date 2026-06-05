import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { auth } from "@/lib/admin/githubAuth";
import { commitFile, contentApiUrl, contentApiWriteUrl, listPosts, readPost } from "@/lib/admin/githubCommit";
import { listLocalPosts, readLocalPost, removeLocalPostOverride, writeLocalPostOverride } from "@/lib/admin/localPosts";
import { drafts, newDraftId, type Draft } from "@/lib/admin/drafts";
import { buildMdx, parseFrontmatter, slugify, type Frontmatter } from "@/lib/admin/frontmatter";
import { ADMIN } from "@/site.config";
import { cn } from "@/lib/utils";
import { MdxPreview } from "@/components/admin/MdxPreview";
import { DateTimePicker, localTz } from "@/components/admin/DateTimePicker";
import {
  Eye,
  Pencil,
  Save,
  Upload,
  Trash2,
  FileText,
  RefreshCw,
  LogOut,
  Calendar as CalendarIcon,
  ArrowLeft,
  Bold,
  Italic,
  Link as LinkIcon,
  Code,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Quote,
  Image as ImageIcon,
  CheckCircle2,
  Loader2,
  Strikethrough,
  Table as TableIcon,
  Minus,
  Sparkles,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  Plus,
  FilePlus,
  Menu,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const todayIso = () => new Date().toISOString();

/** Best-effort: turn an existing frontmatter date value into a UTC ISO. */
const toIsoUtc = (value?: string): string => {
  if (!value) return todayIso();
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return todayIso();
  return d.toISOString();
};

/** Component snippets shown in the Components inserter (toolbar + mobile sheet). */
const COMPONENT_SNIPPETS: Array<{ label: string; hint: string; snippet: string }> = [
  {
    label: "Callout · note",
    hint: "Neutral aside",
    snippet:
      '\n<Callout type="note" title="Note">\nA neutral aside or extra context.\n</Callout>\n',
  },
  {
    label: "Callout · tip",
    hint: "Helpful tip with emoji",
    snippet:
      '\n<Callout type="tip" emoji="💡">\nPro tip goes here.\n</Callout>\n',
  },
  {
    label: "Callout · warning",
    hint: "Caution / gotcha",
    snippet:
      '\n<Callout type="warning" title="Heads up">\nWatch out for this.\n</Callout>\n',
  },
  {
    label: "Callout · danger",
    hint: "Don't-do-this warning",
    snippet:
      '\n<Callout type="danger" title="Don\'t do this">\nNever do X.\n</Callout>\n',
  },
  {
    label: "Callout · success",
    hint: "Positive outcome",
    snippet:
      '\n<Callout type="success" title="Nice">\nIt worked.\n</Callout>\n',
  },
  {
    label: "Pros & Cons",
    hint: "Two-column comparison",
    snippet:
      '\n<ProsCons\n  pros={["First good thing", "Second good thing"]}\n  cons={["First downside", "Second downside"]}\n/>\n',
  },
  {
    label: "Pull quote",
    hint: "Emphasised quotation",
    snippet:
      '\n<Quote author="Someone">\nThe meaningful line goes here.\n</Quote>\n',
  },
  {
    label: "Keyboard key",
    hint: "Inline shortcut keys",
    snippet: "<Kbd>Cmd</Kbd> + <Kbd>K</Kbd>",
  },
  {
    label: "Tweet embed",
    hint: "Embed a tweet by ID",
    snippet: '\n<Tweet id="1683920951807971329" />\n',
  },
  {
    label: "Live code (Sandpack)",
    hint: "Editable React playground",
    snippet:
      '\n<LiveCode\n  template="react"\n  files={{\n    "/App.js": `export default function App() {\n  return <h2>Hello 👋</h2>;\n}`\n  }}\n/>\n',
  },
  {
    label: "Chart · line",
    hint: "Interactive line chart",
    snippet:
      '\n<Chart\n  type="line"\n  title="Weekly users"\n  data={[\n    { week: "W1", users: 120 },\n    { week: "W2", users: 180 },\n    { week: "W3", users: 240 },\n  ]}\n/>\n',
  },
  {
    label: "Chart · bar",
    hint: "Bar / stacked-bar chart",
    snippet:
      '\n<Chart\n  type="bar"\n  title="Errors by service"\n  data={[\n    { day: "Mon", api: 12, web: 4 },\n    { day: "Tue", api: 7,  web: 3 },\n    { day: "Wed", api: 18, web: 6 },\n  ]}\n/>\n',
  },
  {
    label: "Chart · pie",
    hint: "Pie / donut chart",
    snippet:
      '\n<Chart\n  type="pie"\n  title="Stack share"\n  data={[\n    { name: "TypeScript", value: 48 },\n    { name: "Python", value: 22 },\n    { name: "Go", value: 18 },\n  ]}\n/>\n',
  },
  {
    label: "Stats grid",
    hint: "KPI tiles with deltas",
    snippet:
      '\n<Stats cols={3} items={[\n  { label: "Posts", value: "42", change: 8 },\n  { label: "Repos", value: "120", change: 3 },\n  { label: "Build", value: "1.4s", change: -22, changeSuffix: "%" },\n]} />\n',
  },
  {
    label: "Tabs",
    hint: "Tabbed content blocks",
    snippet:
      '\n<Tabs>\n  <Tab label="npm">\n    ```bash\n    npm install pkg\n    ```\n  </Tab>\n  <Tab label="bun">\n    ```bash\n    bun add pkg\n    ```\n  </Tab>\n</Tabs>\n',
  },
  {
    label: "Steps",
    hint: "Numbered walkthrough",
    snippet:
      '\n<Steps>\n  <Step title="Install">\n    Run `bun install`.\n  </Step>\n  <Step title="Configure">\n    Copy `.env.example` to `.env`.\n  </Step>\n  <Step title="Run">\n    Run `bun dev`.\n  </Step>\n</Steps>\n',
  },
  {
    label: "Accordion",
    hint: "Collapsible FAQ",
    snippet:
      '\n<Accordion>\n  <AccordionItem title="Question one?" defaultOpen>\n    Answer one.\n  </AccordionItem>\n  <AccordionItem title="Question two?">\n    Answer two.\n  </AccordionItem>\n</Accordion>\n',
  },
  {
    label: "Video embed",
    hint: "YouTube / file video",
    snippet:
      '\n<Video src="https://www.youtube.com/watch?v=dQw4w9WgXcQ" caption="Caption text" />\n',
  },
  {
    label: "Badge",
    hint: "Inline status pill",
    snippet: '<Badge tone="success">stable</Badge>',
  },
  {
    label: "File tree",
    hint: "Directory diagram",
    snippet:
      '\n<FileTree\n  tree={[\n    { name: "src", type: "folder", children: [\n      { name: "main.tsx" },\n    ]},\n    { name: "package.json" },\n  ]}\n/>\n',
  },
  {
    label: "Table",
    hint: "Markdown table",
    snippet:
      "\n| Column A | Column B |\n| --- | --- |\n| Row 1 | Value |\n| Row 2 | Value |\n",
  },
];

/** Insert text around the current selection in a textarea. */
const wrapSelection = (
  el: HTMLTextAreaElement,
  before: string,
  after = before,
  placeholder = "",
): string => {
  const start = el.selectionStart;
  const end = el.selectionEnd;
  const value = el.value;
  const sel = value.slice(start, end) || placeholder;
  const next = value.slice(0, start) + before + sel + after + value.slice(end);
  requestAnimationFrame(() => {
    el.focus();
    const pos = start + before.length + sel.length + after.length;
    el.setSelectionRange(pos, pos);
  });
  return next;
};

const AdminEditor = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = auth.getToken();
  const isDevSession = auth.isDevSession();
  const canPublish = Boolean(token);
  const user = auth.getCachedUser();

  useEffect(() => {
    if (!token && !isDevSession) navigate("/admin", { replace: true });
  }, [token, isDevSession, navigate]);

  // Draft state
  const [draftId, setDraftId] = useState<string>(() => params.get("d") || newDraftId());
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [date, setDate] = useState<string>(todayIso());
  const [timezone, setTimezone] = useState<string>(() => localTz());
  const [body, setBody] = useState("");
  const [view, setView] = useState<"edit" | "preview">("edit");
  const [savedAt, setSavedAt] = useState<number | null>(null);

  // Sidebar collapse — collapsed by default, icons stay clickable
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const saved = localStorage.getItem("admin_sidebar_collapsed_v1");
    return saved === null ? true : saved === "1";
  });
  useEffect(() => {
    localStorage.setItem("admin_sidebar_collapsed_v1", sidebarCollapsed ? "1" : "0");
  }, [sidebarCollapsed]);

  // Remote posts
  const [remote, setRemote] = useState<
    Array<{ name: string; path: string; sha?: string; source: "github" | "local" }>
  >([]);
  const [loadingRemote, setLoadingRemote] = useState(false);
  const [editingPath, setEditingPath] = useState<string | null>(null);
  const [remoteError, setRemoteError] = useState<string | null>(null);
  const [showInserter, setShowInserter] = useState(false);

  // Publish state
  const [publishing, setPublishing] = useState(false);
  const [publishMsg, setPublishMsg] = useState<string | null>(null);
  const [publishErr, setPublishErr] = useState<string | null>(null);

  const [draftList, setDraftList] = useState<Draft[]>(() => drafts.list());

  const bodyRef = useRef<HTMLTextAreaElement | null>(null);

  // Load draft into form
  useEffect(() => {
    const d = drafts.get(draftId);
    if (!d) return;
    const { data, body } = parseFrontmatter(d.content);
    setEditingPath(d.path || null);
    setTitle((data.title as string) || d.title || "");
    setDescription((data.description as string) || "");
    setTagsInput(((data.tags as string[]) || []).join(", "));
    setDate(toIsoUtc(data.date as string | undefined));
    setBody(body);
  }, [draftId]);

  // Autosave
  const saveTimer = useRef<number | null>(null);
  useEffect(() => {
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      const slug = slugify(title) || draftId;
      const fm: Frontmatter = {
        title: title.trim() || "Untitled",
        description: description.trim(),
        date: toIsoUtc(date),
        tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
      };
      const content = buildMdx(fm, body);
      drafts.upsert({
        id: draftId,
        slug,
        title: fm.title,
        content,
        path: editingPath || undefined,
        updatedAt: Date.now(),
      });
      setSavedAt(Date.now());
      setDraftList(drafts.list());
    }, 500);
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [draftId, title, description, tagsInput, date, body, editingPath]);

  const refreshRemote = async () => {
    setLoadingRemote(true);
    setRemoteError(null);
    const local = listLocalPosts().map((p) => ({
      name: p.name,
      path: p.path,
      source: "local" as const,
    }));
    try {
      const gh = await listPosts(token);
      const ghPaths = new Set(gh.map((g) => g.path));
      const merged = [
        ...gh.map((g) => ({ ...g, source: "github" as const })),
        ...local.filter((l) => !ghPaths.has(l.path)),
      ].sort((a, b) => a.name.localeCompare(b.name));
      setRemote(merged);
    } catch (e) {
      console.warn("GitHub list failed, falling back to local:", e);
      setRemote(local);
      setRemoteError(
        e instanceof Error ? e.message : "GitHub unavailable — showing local posts only.",
      );
    } finally {
      setLoadingRemote(false);
    }
  };
  useEffect(() => {
    refreshRemote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Open any existing post (local OR github) for editing. We always set
   *  editingPath to the file's repo path so publishing updates it in place. */
  const loadRemote = async (path: string) => {
    setRemoteError(null);
    let content: string | null = null;
    const entry = remote.find((r) => r.path === path);
    // 1) Authenticated GitHub read (latest content) when we have a token.
    if (token && entry?.source !== "local") {
      try {
        const r = await readPost(token, path);
        if (typeof r.content === "string" && r.content) content = r.content;
      } catch (e) {
        console.warn("readPost (authed) failed, will retry unauthed:", e);
      }
    }
    // 2) Unauthenticated GitHub read (works for public repos, 60 req/h/IP).
    if (!content && entry?.source !== "local") {
      try {
        const r = await readPost(null, path);
        if (typeof r.content === "string" && r.content) content = r.content;
      } catch (e) {
        console.warn("readPost (unauthed) failed, falling back to local:", e);
      }
    }
    // 3) Locally-bundled MDX as a final fallback — always works offline.
    if (!content) content = readLocalPost(path);
    if (typeof content !== "string" || !content) {
      setRemoteError(`Could not load ${path}.`);
      return;
    }
    const parsed = parseFrontmatter(content);
    const loadedTitle = (parsed.data.title as string) || path.split("/").pop()!.replace(/\.mdx$/, "");
    const id = newDraftId();
    drafts.upsert({
      id,
      slug: path.split("/").pop()!.replace(/\.mdx$/, ""),
      title: loadedTitle,
      content,
      path,
      updatedAt: Date.now(),
    });
    // Set ALL fields synchronously here so the UI updates immediately,
    // even before the [draftId] effect re-parses on the next render.
    setEditingPath(path);
    setTitle(loadedTitle);
    setDescription((parsed.data.description as string) || "");
    setTagsInput(((parsed.data.tags as string[]) || []).join(", "));
    setDate(toIsoUtc(parsed.data.date as string | undefined));
    setBody(parsed.body || "");
    setDraftId(id);
    setView("edit");
    setPublishErr(null);
    setPublishMsg(`Loaded ${path.split("/").pop()} for editing.`);
    setDraftList(drafts.list());
    // Scroll the editor into view on mobile.
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const newDraft = () => {
    const id = newDraftId();
    setDraftId(id);
    setEditingPath(null);
    setTitle("");
    setDescription("");
    setTagsInput("");
    setDate(todayIso());
    setBody("");
  };

  const removeDraft = (id: string) => {
    drafts.remove(id);
    setDraftList(drafts.list());
    if (id === draftId) newDraft();
  };

  const saveDraftNow = () => {
    const slug = slugify(title) || draftId;
    const fm: Frontmatter = {
      title: title.trim() || "Untitled",
      description: description.trim(),
      date: toIsoUtc(date),
      tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
    };
    const content = buildMdx(fm, body);
    drafts.upsert({
      id: draftId,
      slug,
      title: fm.title,
      content,
      path: editingPath || undefined,
      updatedAt: Date.now(),
    });
    setSavedAt(Date.now());
    setDraftList(drafts.list());
  };

  const deletePublished = async () => {
    if (!token || !editingPath) return;
    const filename = editingPath.split("/").pop();
    const ok = confirm(
      `Delete "${filename}" everywhere?\n\n` +
        `• Removes the .mdx file from ${ADMIN.repo.owner}/${ADMIN.repo.name} on branch ${ADMIN.repo.branch} (one commit).\n` +
        `• Clears any local override saved in this browser.\n` +
        `• Removes any matching drafts.\n` +
        `• The post disappears from the UI on the next deploy.\n\n` +
        `Note: git history retains the file in older commits — this is normal and doesn't affect the live site.`,
    );
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const requestDeletePublished = () => {
    if (!token || !editingPath) return;
    setConfirmDeleteOpen(true);
  };

  const deletePublished = async () => {
    if (!token || !editingPath) return;
    const filename = editingPath.split("/").pop();
    setConfirmDeleteOpen(false);
    setPublishing(true);
    setPublishErr(null);
    setPublishMsg(null);
    try {
      const lookupRes = await fetch(
        contentApiUrl(editingPath, ADMIN.repo.branch),
        { headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}` } },
      );
      // 404 = already gone in the repo; still clean local state below.
      let sha: string | null = null;
      if (lookupRes.ok) {
        sha = (await lookupRes.json()).sha as string;
      } else if (lookupRes.status !== 404) {
        throw new Error(`Lookup failed: ${lookupRes.status}`);
      }
      if (sha) {
        const delRes = await fetch(contentApiWriteUrl(editingPath), {
          method: "DELETE",
          headers: {
            Accept: "application/vnd.github+json",
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: `chore(blog): delete ${filename}`,
            sha,
            branch: ADMIN.repo.branch,
          }),
        });
        if (!delRes.ok) throw new Error(`Delete failed: ${delRes.status}`);
      }
      // Local cleanup — overrides + any drafts that pointed at this file.
      removeLocalPostOverride(editingPath);
      for (const d of drafts.list()) {
        if (d.path === editingPath) drafts.remove(d.id);
      }
      setDraftList(drafts.list());
      setPublishMsg(
        sha
          ? `Deleted ${editingPath} from repo and cleared local copies.`
          : `${editingPath} was already gone from the repo — cleared local copies.`,
      );
      // Reset the editor to a fresh draft so we're not pointing at a ghost file.
      newDraft();
      refreshRemote();
    } catch (e) {
      setPublishErr(e instanceof Error ? e.message : String(e));
    } finally {
      setPublishing(false);
    }
  };

  const insertSnippet = (snippet: string) => {
    apply((el) => {
      const start = el.selectionStart;
      const value = el.value;
      const next = value.slice(0, start) + snippet + value.slice(el.selectionEnd);
      requestAnimationFrame(() => {
        el.focus();
        const pos = start + snippet.length;
        el.setSelectionRange(pos, pos);
      });
      return next;
    });
    setShowInserter(false);
  };

  const slug = useMemo(() => slugify(title) || draftId, [title, draftId]);
  const filename = `${slug}.mdx`;
  // If editing an existing file, keep its path. Otherwise place it in contentDir.
  const targetPath = editingPath || `${ADMIN.repo.contentDir}/${filename}`;
  const isScheduled = useMemo(() => new Date(date).getTime() > Date.now(), [date]);

  const wordCount = useMemo(
    () => body.trim().split(/\s+/).filter(Boolean).length,
    [body],
  );
  const readMin = Math.max(1, Math.round(wordCount / 200));

  const publish = async () => {
    if (!token) {
      if (!editingPath) {
        setPublishErr("Sign in with GitHub to publish a new post.");
        return;
      }
      const fm: Frontmatter = {
        title: title.trim() || "Untitled",
        description: description.trim(),
        date: toIsoUtc(date),
        tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
      };
      const content = buildMdx(fm, body);
      writeLocalPostOverride(editingPath, content);
      drafts.upsert({
        id: draftId,
        slug,
        title: fm.title,
        content,
        path: editingPath,
        updatedAt: Date.now(),
      });
      setPublishErr(null);
      setPublishMsg("Updated locally in this browser. Sign in with GitHub when you want to update the repo.");
      setSavedAt(Date.now());
      setDraftList(drafts.list());
      refreshRemote();
      return;
    }
    setPublishing(true);
    setPublishErr(null);
    setPublishMsg(null);
    try {
      const fm: Frontmatter = {
        title: title.trim() || "Untitled",
        description: description.trim(),
        date: toIsoUtc(date),
        tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
      };
      const content = buildMdx(fm, body);
      const result = await commitFile({
        token,
        path: targetPath,
        content,
        message: editingPath
          ? `chore(blog): update ${targetPath.split("/").pop()}`
          : `feat(blog): publish ${filename}${isScheduled ? " (scheduled)" : ""}`,
      });
      setPublishMsg(
        isScheduled
          ? `Scheduled. Will appear after ${new Date(date).toLocaleString()}.`
          : `${editingPath ? "Updated" : "Published"}. ${result.htmlUrl}`,
      );
      // After a successful publish of a brand-new post, lock onto it so
      // subsequent saves overwrite the same file.
      if (!editingPath) setEditingPath(targetPath);
      refreshRemote();
    } catch (e) {
      setPublishErr(e instanceof Error ? e.message : String(e));
    } finally {
      setPublishing(false);
    }
  };

  const apply = (fn: (el: HTMLTextAreaElement) => string) => {
    if (!bodyRef.current) return;
    setBody(fn(bodyRef.current));
  };

  const signOut = () => {
    auth.clearSession();
    navigate("/admin", { replace: true });
  };

  if (!token && !isDevSession) return null;

  // ============ Sidebar ============
  // Collapsed: icon-only rail. Expanded: full controls + post list.
  const SideButton = ({
    icon: Icon,
    label,
    onClick,
    disabled,
    danger,
    primary,
    title: tooltip,
  }: {
    icon: typeof Save;
    label: string;
    onClick: () => void;
    disabled?: boolean;
    danger?: boolean;
    primary?: boolean;
    title?: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={tooltip || label}
      aria-label={label}
      className={cn(
        "group flex items-center gap-2.5 rounded-md px-2 py-2 text-sm transition-all",
        sidebarCollapsed ? "w-9 justify-center" : "w-full",
        primary
          ? "bg-foreground text-background hover:opacity-90 disabled:opacity-40"
          : danger
            ? "border border-destructive/40 bg-destructive/5 text-destructive hover:bg-destructive/10 disabled:opacity-40"
            : "border border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground disabled:opacity-40",
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      {!sidebarCollapsed && <span className="truncate">{label}</span>}
    </button>
  );

  const sidebar = (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col gap-4 rounded-xl border border-border bg-card/60 backdrop-blur-sm transition-[width] duration-300 ease-out-expo",
        sidebarCollapsed ? "w-14 p-2" : "w-64 p-3",
      )}
    >

      {/* Top: collapse toggle + brand */}
      <div className={cn("flex items-center", sidebarCollapsed ? "justify-center" : "justify-between")}>
        {!sidebarCollapsed && (
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
            editor
          </span>
        )}
        <button
          type="button"
          onClick={() => setSidebarCollapsed((c) => !c)}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={sidebarCollapsed ? "Expand" : "Collapse"}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-1 hover:text-foreground"
        >
          {sidebarCollapsed ? (
            <ChevronsRight className="h-4 w-4" />
          ) : (
            <ChevronsLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Primary actions */}
      <div className="flex flex-col gap-1.5">
        <SideButton
          icon={ArrowLeft}
          label="Back to site"
          onClick={() => navigate("/")}
        />
        <SideButton
          icon={FilePlus}
          label="New draft"
          onClick={newDraft}
        />
        <SideButton
          icon={Save}
          label={savedAt ? "Saved" : "Save draft"}
          onClick={saveDraftNow}
          title="Save draft locally"
        />
        <SideButton
          icon={publishing ? Loader2 : Upload}
          label={publishing ? "Pushing…" : isScheduled ? "Schedule" : editingPath ? "Update post" : "Publish"}
          onClick={publish}
          disabled={publishing || !title.trim() || (!canPublish && !editingPath)}
          primary
          title={!canPublish && !editingPath ? "GitHub sign-in required to publish" : undefined}
        />
        {editingPath && canPublish && (
          <SideButton
            icon={Trash2}
            label="Delete post"
            onClick={deletePublished}
            disabled={publishing}
            danger
          />
        )}
      </div>

      {/* Scrollable body: drafts + posts */}
      <div className="min-h-0 flex-1 overflow-y-auto pr-0.5">
        {!sidebarCollapsed ? (
          <div className="space-y-6">
            {/* Drafts */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <h2 className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                  Drafts · {draftList.length}
                </h2>
                <span aria-hidden className="h-px flex-1 bg-border/70" />
              </div>
              <ul className="space-y-1">
                {draftList.length === 0 && (
                  <li className="rounded-md border border-dashed border-border/70 px-2 py-3 text-center text-[11px] text-muted-foreground">
                    No drafts yet.
                  </li>
                )}
                {draftList.map((d) => (
                  <li
                    key={d.id}
                    className={cn(
                      "group flex items-center gap-2 rounded-md border border-transparent px-2 py-1.5 text-xs transition-all",
                      d.id === draftId
                        ? "border-border bg-surface-1 shadow-elev-sm"
                        : "hover:bg-surface-1/60",
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "h-1.5 w-1.5 shrink-0 rounded-full",
                        d.id === draftId ? "bg-accent" : "bg-border",
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setDraftId(d.id);
                        setEditingPath(d.path || null);
                      }}
                      className="min-w-0 flex-1 truncate text-left"
                    >
                      {d.title || "Untitled"}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeDraft(d.id)}
                      aria-label="Delete draft"
                      className="opacity-60 transition-opacity hover:opacity-100"
                    >
                      <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Posts (any source — clicking opens for edit) */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <h2 className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                  Posts · {remote.length}
                </h2>
                <button
                  type="button"
                  onClick={refreshRemote}
                  aria-label="Refresh"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <RefreshCw className={cn("h-3 w-3", loadingRemote && "animate-spin")} />
                </button>
                <span aria-hidden className="h-px flex-1 bg-border/70" />
              </div>
              <ul className="space-y-1">
                {remote.map((f) => (
                  <li key={f.path}>
                    <button
                      type="button"
                      onClick={() => loadRemote(f.path)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors hover:bg-surface-1/60",
                        editingPath === f.path
                          ? "bg-surface-1 text-foreground"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <FileText className="h-3 w-3 shrink-0" />
                      <span className="truncate">{f.name}</span>
                      <span
                        className={cn(
                          "ml-auto rounded-full border px-1.5 py-px font-mono text-[8px] uppercase tracking-[0.14em]",
                          f.source === "github"
                            ? "border-success/40 bg-success/10 text-success"
                            : "border-border bg-surface-2 text-muted-foreground",
                        )}
                      >
                        {f.source === "github" ? "live" : "local"}
                      </span>
                    </button>
                  </li>
                ))}
                {remote.length === 0 && !loadingRemote && (
                  <li className="rounded-md border border-dashed border-border/70 px-2 py-3 text-center text-[11px] text-muted-foreground">
                    Nothing here yet.
                  </li>
                )}
              </ul>
              {remoteError && (
                <p className="mt-2 rounded-md border border-warning/30 bg-warning/5 px-2 py-1.5 text-[10px] leading-relaxed text-muted-foreground">
                  {remoteError}
                </p>
              )}
            </div>
          </div>
        ) : (
          // Collapsed icon list — clickable shortcuts to recent posts
          <div className="flex flex-col items-center gap-1">
            {remote.slice(0, 8).map((f) => (
              <button
                key={f.path}
                type="button"
                onClick={() => loadRemote(f.path)}
                title={f.name}
                aria-label={`Open ${f.name}`}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-md transition-colors",
                  editingPath === f.path
                    ? "bg-surface-1 text-foreground"
                    : "text-muted-foreground hover:bg-surface-1 hover:text-foreground",
                )}
              >
                <FileText className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer: status + sign out */}
      <div className="flex flex-col gap-2 border-t border-border/60 pt-3">
        {!sidebarCollapsed && (
          <div className="flex items-center justify-between gap-2 px-1 font-mono text-[10px] text-muted-foreground">
            <span>{wordCount}w · {readMin}m</span>
            {savedAt && (
              <span className="inline-flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                {new Date(savedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </div>
        )}
        <div className={cn("flex items-center gap-2", sidebarCollapsed ? "flex-col" : "")}>
          {user ? (
            <img
              src={user.avatar_url}
              alt={user.login}
              title={user.login}
              className="h-8 w-8 rounded-full ring-1 ring-border"
            />
          ) : (
            <div
              title="Local PIN session"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface-1 font-mono text-[10px] text-muted-foreground"
            >
              {ADMIN.devUsername.slice(0, 2).toUpperCase()}
            </div>
          )}
          {!sidebarCollapsed && (
            <div className="min-w-0 flex-1 truncate text-xs">
              <div className="truncate text-foreground">{user?.login || ADMIN.devUsername}</div>
              <div className="truncate font-mono text-[10px] text-muted-foreground">
                {canPublish ? "can publish" : "preview only"}
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={signOut}
            aria-label="Sign out"
            title="Sign out"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-1 hover:text-foreground"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );

  // Toolbar buttons
  const ToolBtn = ({
    icon: Icon,
    label,
    onClick,
  }: {
    icon: typeof Bold;
    label: string;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-all hover:bg-surface-2 hover:text-foreground active:scale-95"
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );

  return (
    // App-shell: the editor occupies the viewport below the floating nav.
    // Sidebar and editor column have their OWN scroll regions — the page
    // itself never scrolls, so the sidebar and frontmatter stay put.
    <div className="h-[calc(100dvh-4rem)] sm:h-[calc(100dvh-5rem)] overflow-hidden">
      <div className="container-wide flex h-full gap-4 py-3 sm:py-4">
        {sidebar}

        {/* Editor column — its own flex shell with sticky header & toolbar */}
        <div className="flex h-full min-w-0 flex-1 flex-col gap-3">
          {/* Frontmatter (fixed at top of column) */}
          <div className="shrink-0 space-y-2.5 border-b border-border/60 pb-3">
            <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              <span>{editingPath ? "editing" : "draft"}</span>
              <span aria-hidden>·</span>
              <span className="truncate">{editingPath || filename}</span>
              {isScheduled && (
                <span className="rounded-full border border-warning/40 bg-warning/10 px-2 py-0.5 normal-case tracking-normal text-warning">
                  scheduled
                </span>
              )}
              {editingPath && (
                <span className="rounded-full border border-success/40 bg-success/10 px-2 py-0.5 normal-case tracking-normal text-success">
                  live post
                </span>
              )}
              {!canPublish && (
                <span className="rounded-full border border-border bg-surface-1/70 px-2 py-0.5 normal-case tracking-normal text-muted-foreground">
                  preview-only session
                </span>
              )}
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled post"
              className="w-full bg-transparent font-serif text-2xl leading-tight outline-none placeholder:text-muted-foreground/60 sm:text-3xl"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A one-line description, like a deck for the article."
              rows={1}
              className="w-full resize-none bg-transparent text-sm leading-relaxed text-muted-foreground outline-none placeholder:text-muted-foreground/60"
            />
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="tags, comma, separated"
                className="min-w-[180px] flex-1 rounded-md border border-border bg-background px-2.5 py-1.5 outline-none transition-colors focus:border-foreground/40"
              />
              <DateTimePicker
                value={date}
                onChange={setDate}
                timezone={timezone}
                onTimezoneChange={setTimezone}
              />
            </div>
          </div>

          {publishMsg && (
            <div className="shrink-0 flex items-start gap-2 rounded-md border border-success/40 bg-success/10 p-2.5 text-xs">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
              <span className="break-all">{publishMsg}</span>
            </div>
          )}
          {publishErr && (
            <div className="shrink-0 rounded-md border border-destructive/40 bg-destructive/10 p-2.5 text-xs text-destructive">
              {publishErr}
            </div>
          )}

          {/* Formatting toolbar (fixed, above the scrolling body) */}
          <div className="shrink-0 flex items-center gap-0.5 overflow-x-auto rounded-lg border border-border bg-card/95 p-1 shadow-elev-sm backdrop-blur-xl supports-[backdrop-filter]:bg-card/80 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:overflow-visible">
            {/* View toggle (inline at the start of the toolbar) */}
            <div className="inline-flex shrink-0 items-center gap-0.5 rounded-md border border-border bg-surface-1/60 p-0.5">
              {(
                [
                  { v: "edit", icon: Pencil, label: "Write" },
                  { v: "preview", icon: Eye, label: "Preview" },
                ] as const
              ).map(({ v, icon: Icon, label }) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  className={cn(
                    "inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium transition-all",
                    view === v
                      ? "bg-foreground text-background shadow-elev-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {label}
                </button>
              ))}
            </div>

            <span className="mx-1 h-5 w-px bg-border" />

            {view === "edit" && (
              <>
                <ToolBtn icon={Heading2} label="Heading 2" onClick={() => apply((el) => wrapSelection(el, "## ", "", "Heading"))} />
                <ToolBtn icon={Heading3} label="Heading 3" onClick={() => apply((el) => wrapSelection(el, "### ", "", "Subheading"))} />
                <ToolBtn icon={Bold} label="Bold" onClick={() => apply((el) => wrapSelection(el, "**", "**", "bold"))} />
                <ToolBtn icon={Italic} label="Italic" onClick={() => apply((el) => wrapSelection(el, "_", "_", "italic"))} />
                <ToolBtn icon={Strikethrough} label="Strikethrough" onClick={() => apply((el) => wrapSelection(el, "~~", "~~", "strike"))} />
                <ToolBtn icon={Code} label="Inline code" onClick={() => apply((el) => wrapSelection(el, "`", "`", "code"))} />
                <ToolBtn icon={FileText} label="Code block" onClick={() => apply((el) => wrapSelection(el, "\n```ts\n", "\n```\n", "// code"))} />
                <span className="mx-1 h-5 w-px bg-border" />
                <ToolBtn icon={LinkIcon} label="Link" onClick={() => apply((el) => wrapSelection(el, "[", "](https://)", "label"))} />
                <ToolBtn icon={ImageIcon} label="Image" onClick={() => apply((el) => wrapSelection(el, "![", "](https://)", "alt"))} />
                <ToolBtn icon={Quote} label="Quote" onClick={() => apply((el) => wrapSelection(el, "> ", "", "quote"))} />
                <span className="mx-1 h-5 w-px bg-border" />
                <ToolBtn icon={List} label="List" onClick={() => apply((el) => wrapSelection(el, "- ", "", "item"))} />
                <ToolBtn icon={ListOrdered} label="Numbered list" onClick={() => apply((el) => wrapSelection(el, "1. ", "", "item"))} />
                <ToolBtn icon={TableIcon} label="Table" onClick={() => insertSnippet("\n| Column A | Column B |\n| --- | --- |\n| cell | cell |\n| cell | cell |\n")} />
                <ToolBtn icon={Minus} label="Divider" onClick={() => insertSnippet("\n\n---\n\n")} />
                <span className="mx-1 h-5 w-px bg-border" />
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowInserter((v) => !v)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Components</span>
                    <ChevronDown className="h-3 w-3" />
                  </button>
                  {showInserter && (
                    <>
                      {/* Click-outside backdrop */}
                      <button
                        type="button"
                        aria-label="Close components"
                        onClick={() => setShowInserter(false)}
                        className="fixed inset-0 z-20 cursor-default bg-transparent"
                      />
                      <div
                        role="menu"
                        className="absolute right-0 top-full z-30 mt-2 w-[min(92vw,520px)] overflow-hidden rounded-xl border border-border bg-popover shadow-elev-lg"
                      >
                        <div className="flex items-center justify-between border-b border-border/60 px-3 py-2">
                          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                            Insert component
                          </span>
                          <span className="text-[10px] text-muted-foreground/70">
                            {COMPONENT_SNIPPETS.length} blocks
                          </span>
                        </div>
                        <div className="max-h-[60vh] overflow-y-auto p-2">
                          <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                            {COMPONENT_SNIPPETS.map((item) => (
                              <button
                                key={item.label}
                                type="button"
                                onClick={() => insertSnippet(item.snippet)}
                                className="group flex flex-col gap-0.5 rounded-md border border-transparent px-2.5 py-1.5 text-left transition-colors hover:border-border hover:bg-surface-1"
                              >
                                <span className="text-[12px] font-medium text-foreground">
                                  {item.label}
                                </span>
                                <span className="truncate text-[10px] text-muted-foreground">
                                  {item.hint}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Editor / preview — only this region scrolls as content grows */}
          <div className="min-h-0 flex-1">
            {view === "edit" ? (
              <div className="relative h-full overflow-hidden rounded-xl border border-border bg-surface-1/30 transition-colors focus-within:border-foreground/30 focus-within:bg-surface-1/50">
                <textarea
                  ref={bodyRef}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Start writing. Markdown and MDX components both work…"
                  spellCheck={false}
                  className="h-full w-full resize-none bg-transparent p-5 font-mono text-[13px] leading-[1.7] outline-none placeholder:text-muted-foreground/50 sm:p-7 sm:text-sm sm:leading-[1.75]"
                />
              </div>
            ) : (
              <div className="relative h-full overflow-y-auto rounded-xl border border-border bg-background">
                <div className="sticky right-3 top-3 z-10 ml-auto inline-block rounded-full border border-border bg-card/80 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
                  preview
                </div>
                <article className="prose prose-neutral max-w-none p-5 dark:prose-invert sm:p-8">
                  {title && (
                    <h1 className="!mb-2 !mt-0 !font-serif !text-3xl !font-normal sm:!text-4xl">
                      {title}
                    </h1>
                  )}
                  {description && (
                    <p className="!mt-0 !mb-6 text-lg !text-muted-foreground">{description}</p>
                  )}
                  <MdxPreview source={body} />
                </article>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEditor;

