# Personal Site & Blog

A fast, file-based personal site with an MDX blog, an in-browser editor that commits posts to GitHub, a GitHub activity feed on the home page, and a printable CV.

Built with React 18, Vite, MDX, Tailwind, and Recharts. No backend — everything runs in the browser and reads MDX files directly from this repo.

---

## What you need before you start

1. A GitHub account (this is where your blog posts will live, as `.mdx` files).
2. A free Vercel **or** Netlify account (to host the site).
3. Node 20+ and `bun` (or `npm`) installed locally if you want to run it on your machine.

That is it. There is no database, no server to rent, no API keys to pay for.

---

## Step 1 — Make the project yours

Open `src/site.config.ts` and replace the placeholder values:

- `SITE.BASE_URL` — fallback only. The real value comes from the `VITE_SITE_URL` environment variable (Step 4).
- `SITE.name`, `title`, `description`, `twitterHandle` — your name and tagline.
- `AUTHOR` — name, role, bio, email, and your social links.
- `GITHUB.username` — your GitHub handle. The home page pulls public repos and recent commits from this account.
- `GITHUB.repoIdAllowlist` / `repoAllowlist` / `pinned` / `featured` — which repos to feature. Leave the arrays empty to show everything.
- `ADMIN.repo.owner` / `name` / `branch` / `contentDir` — the repo and branch where blog posts are committed (usually this same repo).
- `ADMIN.devUsername` / `devPin` — a 4-digit PIN for **read-only** preview access to `/admin` when you do not want to sign in with GitHub. Change both before you deploy.

Save. The whole site updates from this one file.

---

## Step 2 — Set up the in-browser blog editor (optional but recommended)

The editor at `/admin` lets you write new posts in the browser and commit them straight to your repo. To enable publishing, create a GitHub OAuth App so the editor can sign you in:

1. Go to <https://github.com/settings/developers>.
2. Click **New OAuth App**.
3. Fill in:
   - **Application name** — anything, e.g. `My Site Admin`.
   - **Homepage URL** — your site URL (you can use a placeholder for now, e.g. `https://example.com`).
   - **Authorization callback URL** — any value; the device flow ignores it. Use the homepage URL again.
4. Create the app, then open it and **enable Device Flow** (checkbox under General).
5. Copy the **Client ID** shown at the top of the page.
6. Paste it into `ADMIN.githubClientId` in `src/site.config.ts`.

The Client ID is public and safe to commit. There is no client secret used.

After deploying, visit `/admin`, click **Continue with GitHub**, enter the device code on github.com, and you are signed in. Your token stays in your browser only.

---

## Step 3 — Write your first post

Posts live in `content/blog/` as `.mdx` files. Two ways to add one:

**A. By hand:** create `content/blog/my-first-post.mdx`:

```mdx
export const frontmatter = {
  title: "My first post",
  description: "A one-line summary that shows in cards and search results.",
  date: "2026-01-15",
  tags: ["intro", "writing"],
};

Hello, world.
```

Drop it in the folder, push to GitHub, and it appears at `/blog/my-first-post`.

**B. From the browser:** go to `/admin/editor` after signing in. Write, preview, and click **Publish** — it commits the file for you.

Use `mdx-showcase.mdx` as a reference for the custom components (callouts, charts, tabs, code blocks, etc.) available without imports.

---

## Step 4 — Deploy

The site is pure static output, so any static host works. Two recommended paths:

### Vercel (easiest)

1. Push this repo to GitHub.
2. Go to <https://vercel.com/new> and import the repo.
3. Framework preset: **Vite**. Build command and output dir auto-detect.
4. Under **Environment Variables**, add:
   - `VITE_SITE_URL` = `https://your-domain.com` (no trailing slash). This drives every canonical URL, OG tag, sitemap entry, and JSON-LD reference on the site.
5. Deploy.
6. Add your custom domain under **Settings → Domains**.

### Netlify

Same idea. Build command: `bun run build` (or `npm run build`). Publish directory: `dist`. Add the `VITE_SITE_URL` environment variable. Deploy.

---

## Step 5 — Auto-publish scheduled posts (optional)

You can write a post with a future `date` in its frontmatter and it stays hidden until that date is in the past. The site is statically built, so it needs a rebuild for the post to actually appear. The included GitHub Action handles this:

`.github/workflows/publish-scheduled.yml` runs every hour and triggers a rebuild via a deploy hook.

To enable it:

1. In Vercel: **Settings → Git → Deploy Hooks → Create Hook**. Name it (e.g. `scheduled-publish`), pick your production branch, and copy the URL. (Netlify has the same feature under **Site Settings → Build & Deploy → Build Hooks**.)
2. In your GitHub repo: **Settings → Secrets and variables → Actions → New repository secret**.
   - Name: `DEPLOY_HOOK_URL`
   - Value: the URL you just copied.
3. Commit and push. The workflow starts running on the schedule.

If you do not need scheduled posts, just delete the workflow file.

---

## Step 6 — Sanity check

Once deployed, verify:

- Your `/blog` page lists your posts.
- The home page shows your GitHub repos and recent commits.
- `/cv` renders your CV from `src/lib/cvData.ts` (edit that file to update it).
- `/admin` accepts your PIN (preview only) and your GitHub login (publish).
- View source on any page — `<meta>` tags should reflect your `VITE_SITE_URL`, not the placeholder.
- `https://your-domain.com/sitemap.xml` and `/robots.txt` resolve.

---

## Running locally

```bash
bun install      # or: npm install
bun dev          # or: npm run dev
```

Open <http://localhost:8080>.

To preview a production build:

```bash
bun run build
bun run preview
```

---

## Project layout, in plain words

- `content/blog/` — your MDX posts. One file per post.
- `src/site.config.ts` — single source of truth for site identity, GitHub feed, and admin settings.
- `src/lib/cvData.ts` — your CV content.
- `src/components/mdx/` — the custom MDX components (callouts, charts, tabs, etc.).
- `src/pages/` — page components (home, blog, post, activity, CV, admin).
- `public/` — static files served as-is (favicon, `og.png`, etc.). Replace `public/og.png` with your own social-share image (1200×630).
- `vite.config.ts` — build config; injects `VITE_SITE_URL` into static files at build time.

---

## Things to keep in mind

- **Never commit a GitHub personal access token.** The editor only ever uses tokens issued by the OAuth Device Flow, which live in your browser's `localStorage` and never reach the repo.
- The PIN in `ADMIN.devPin` is **client-side only**. It gates UI access on shared devices but cannot stop a determined visitor from reading the source. Anything destructive (publishing, deleting posts) still requires a real GitHub sign-in.
- If you change `VITE_SITE_URL`, redeploy — it is read at build time, not runtime.
- Replace `public/og.png` with your own 1200×630 social card before sharing the site.

That is everything. Edit `site.config.ts`, drop in `.env.example` values for your host, push, done.
