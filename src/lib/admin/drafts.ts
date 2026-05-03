/**
 * Local drafts. Lives in localStorage — never leaves the browser
 * until you explicitly publish.
 */
export interface Draft {
  id: string;
  slug: string;
  title: string;
  content: string; // full MDX with frontmatter
  /** Existing repo/local file path when this draft edits a published post. */
  path?: string;
  updatedAt: number;
}

const KEY = "admin_drafts_v1";

const read = (): Draft[] => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]") as Draft[];
  } catch {
    return [];
  }
};
const write = (list: Draft[]) => localStorage.setItem(KEY, JSON.stringify(list));

export const drafts = {
  list: (): Draft[] => read().sort((a, b) => b.updatedAt - a.updatedAt),
  get: (id: string): Draft | undefined => read().find((d) => d.id === id),
  upsert: (d: Draft) => {
    const all = read();
    const i = all.findIndex((x) => x.id === d.id);
    if (i >= 0) all[i] = d;
    else all.push(d);
    write(all);
  },
  remove: (id: string) => write(read().filter((d) => d.id !== id)),
};

export const newDraftId = () =>
  `d_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
