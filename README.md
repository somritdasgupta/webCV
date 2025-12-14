# Somrit Dasgupta - Portfolio & Blog

> Modern, minimal portfolio website built with Next.js 15, featuring a blog, projects showcase, and optimized for SEO.

**Live:** [somritdasgupta.in](https://somritdasgupta.in)

## Tech Stack

- **Framework:** Next.js 15 (App Router, React Server Components)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 with CSS custom properties
- **Fonts:** Geist Sans & Geist Mono (variable fonts)
- **Content:** MDX with next-mdx-remote
- **Code Highlighting:** Custom syntax highlighting with Shiki
- **Deployment:** Vercel (Edge Runtime)
- **Analytics:** Google Analytics 4, Vercel Analytics, Speed Insights
- **SEO:** Structured data (JSON-LD), dynamic sitemap, robots.txt
- **API:** GitHub REST API for dynamic project fetching

## Quick Start

```bash
# Clone repository
git clone https://github.com/somritdasgupta/webCV.git
cd webCV

# Install dependencies
pnpm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your values

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
GRAVATAR_EMAIL=your@email.com
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GOOGLE_VERIFICATION=your-verification-code
```

## Build

```bash
# Production build
pnpm build

# Start production server
pnpm start
```

## Project Structure

```
webCV/
├── app/
│   ├── api/              # API routes (GitHub, OG images)
│   ├── blog/             # Blog pages and utilities
│   ├── components/       # React components
│   ├── lib/              # Utilities and constants
│   ├── layout.tsx        # Root layout with metadata
│   └── page.tsx          # Home page
├── contents/             # MDX blog posts
├── public/               # Static assets
└── .env.local            # Environment variables
```

## Key Features

### SEO Optimization
- Structured data with Schema.org (Person, Blog, WebSite, BreadcrumbList)
- Dynamic sitemap generation
- Open Graph and Twitter Card meta tags
- Google Search Console verification
- Canonical URLs and RSS feed

### Performance
- Server-side rendering (SSR) and Static Site Generation (SSG)
- Incremental Static Regeneration (ISR)
- Image optimization with Next.js Image
- Font optimization with variable fonts
- Edge runtime for API routes

### Design System
- Glassmorphism with backdrop blur
- Custom glowing border effects using CSS masks
- Dark/light mode with system preference detection
- Responsive design (mobile-first approach)
- Animated grid background

## Customization

- **Content:** Edit files in `app/` and `contents/`
- **Styling:** Modify `app/global.css` and Tailwind classes
- **Base URL:** Update `NEXT_PUBLIC_BASE_URL` in `.env.local`
- **Resume:** Replace `public/Resume.pdf`
- **Images:** Update `public/` assets
- **Social Links:** Edit `app/lib/constants.ts`
- **Theme Colors:** Modify CSS variables in `app/global.css`

## License

MIT License - see [LICENSE](LICENSE) file
