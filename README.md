# Reem Basho · portfolio

A one-page interactive CV with two lenses: **Build** (software development) and **Research** (AI research). It's built with React, Vite and TypeScript. There's no backend and no tracking, everything used is free, and it deploys to GitHub Pages.

The whole site is designed as a photographer's **contact sheet**. Projects are frames on a film strip, picked frames are circled in grease pencil, and margin notes ask the questions behind each project. Switching lens swaps the light: the Build lens is a bright light table, the Research lens is a darkroom under amber safelight.

## Run it locally

```powershell
npm install
```

```powershell
npm run dev
```

Open http://localhost:5173. To check the production build:

```powershell
npm run build
```

```powershell
npm run preview
```

## Deploy to GitHub Pages

1. Create a GitHub repository and push this folder to its `main` branch.
2. On GitHub, go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
3. Every push to `main` runs `.github/workflows/deploy.yml`, which builds the site and publishes it to `https://<your-username>.github.io/<repo-name>/`.

Asset paths are relative (`base: './'` in `vite.config.ts`), so the same build also works on a custom domain or at a user site (`<username>.github.io`).

## Editing content

All text lives in **`src/data/content.ts`**. Components only read from it.

| What | Where in `content.ts` |
|---|---|
| Name, headline, per-lens role and pitch, email, links | `profile` |
| CV PDF per lens | `profile.cv` (files go in `public/cv/`) |
| About paragraphs | `about` |
| Projects (question, what I did, numbers, honest note, stack) | `projects` |
| Which projects each lens shows, and in what order | `order` |
| The "now" section (team lead, harness steps) | `now` |
| Questions section, and which frame each one opens | `questions` (`target` is a project id, or `'now'`) |
| Learning log | `learning` (`lenses` decides which rows are marked) |
| Skills | `skills` |
| Recognition | `recognition` |

**CV PDFs.** `public/cv/Reem-Basho-CV.pdf` was exported from the November 2026 CV and is used by both lenses. To give each lens its own version, add e.g. `Reem-Basho-CV-Research.pdf` and point `profile.cv.research` at it.

**Sharing a lens.** Add `?lens=research` or `?lens=build` to the URL. That's handy to link from a research-focused or a dev-focused application.

**Adding a project.** Add an entry to `projects`, put a photo in `public/img/<name>.webp` (about 1400px wide, WebP), set `img: '<name>'`, then add its id to `order.build` and/or `order.research`. Projects without a photo can use `glyph: 'count'` or `glyph: 'ledger'` (drawn figures in `src/components/Glyph.tsx`). Add the photo's license to `docs/CREDITS.md` and `src/data/credits.ts`.

## SEO

- `index.html` holds the title, description, canonical URL, Open Graph and Twitter tags, and Person / WebSite / ProfilePage structured data. The site address comes from `VITE_SITE_URL` in `.env`; change it there if you move to a custom domain.
- The build **prerenders** the page (`src/entry-server.tsx`, `scripts/prerender.mjs`), so the full text is in the HTML for search engines and link previews, not only after JavaScript runs.
- The build also writes `sitemap.xml`, `robots.txt` and `404.html`.
- Share images: `public/og.jpg`, `articles/og.jpg` and `public/apple-touch-icon.png` are drawn from the site's fonts and photos by `npm run og-images` (needs Python with Pillow, fontTools and brotli).

After the first deploy, add the site in [Google Search Console](https://search.google.com/search-console) and submit `https://reemb-prog.github.io/sitemap.xml`. That's the fastest way to get indexed.

## Articles (/articles)

A separate blog, **Field notes**, at `/articles/`. It isn't linked from the portfolio and the portfolio isn't linked from it. Its job is to make Reem findable in search. Behind the scenes, its structured data names the same author (same GitHub and LinkedIn), so search engines can tell it's the same person.

| What | Where |
|---|---|
| Posts | `articles/posts/YYYY-MM-DD-slug.md` (front matter: title, description, date, category, tags, slug) |
| Topic queue | `articles/topics.json` (the weekly writer takes the first one) |
| Look | `articles/style.css` (light paper by day, darkroom at night, follows the reader's system setting) |
| Generator | `scripts/build-articles.mjs` → index pages, one page per post, `feed.xml` (RSS), sitemap |

**Writing one yourself.** Add a Markdown file to `articles/posts/` with the same front matter as the existing ones. `category` is `development`, `research` or `notes`. Add `draft: true` to keep it unpublished. Posts dated in the future wait until that date's build.

**The weekly writer.** `.github/workflows/weekly-article.yml` runs every Monday at 06:00 UTC. It:

1. takes the next topic from `articles/topics.json` (or, when the queue is empty, has the model pick a fresh topic in the next category of the rotation),
2. writes the article with **GitHub Models** (free, uses the workflow's built-in token, model `openai/gpt-4.1` with `gpt-4.1-mini` as fallback),
3. checks it: format, length, at least four sections, no talk of being an AI, and removes any link that isn't to official docs, so citations can't be invented,
4. builds the site to make sure nothing breaks, commits the post, and redeploys.

The writing rules (voice, and never inventing experiences, numbers or quotes) are in `SYSTEM` at the top of `scripts/write-article.mjs`.

One-time setup on GitHub:

- Nothing is needed for auto-publishing. To test it, open **Actions → Weekly article → Run workflow**.
- **Review mode (optional):** under **Settings → Secrets and variables → Actions → Variables**, add `ARTICLE_REVIEW_MODE` = `true`. Each article then arrives as a pull request and goes live when you merge it. This also needs **Settings → Actions → General → Allow GitHub Actions to create and approve pull requests**.
- **Another model (optional):** set the variable `ARTICLE_MODEL`, e.g. `openai/gpt-4.1-mini`.

If a run fails (for example the model's free rate limit), GitHub emails you, and nothing is published that week.

## How it works

| Interaction | Behaviour |
|---|---|
| "Who's looking?" | The visitor picks a lens in the hero. The choice is remembered in localStorage and added to the URL. Until they choose, the page shows the Build lens. |
| Lens switch | The lamp flickers off and the new light comes on. Colours, photo tint, project order, pitch, the learning-log highlights and skill order all change. |
| Film strip | Drag with the mouse, swipe on touch, or use the arrow buttons. Hovering a photo shows a colour loupe. Clicking a frame opens it on the light table. |
| Keys | `1`–`9` pick a frame. |
| Questions | Each question opens the project behind it, switching lens if that project lives in the other lens. |
| Reduced motion | Flicker, film developing, drawn marks and layout animation are all turned off. |

## Project structure

```
src/
  data/content.ts     all copy, from the CV
  data/credits.ts     photo credits (shown in the footer)
  components/
    FilmStrip.tsx     draggable strip, loupe, developing photos
    Detail.tsx        the selected project ("On the light table")
    Sections.tsx      header, hero + lens chooser, about, now, questions, learning, toolkit, contact, footer
    Marks.tsx         hand-drawn grease-pencil circle, underline, arrow (SVG)
    Glyph.tsx         drawn figures for projects without a photo
  index.css           design tokens for both lenses and all styles
  lib.ts              lens persistence, asset paths
public/
  img/                18 photos (WebP, about 640 KB total)
  cv/                 CV PDF
docs/
  DECISIONS.md        why it's designed this way, for the reader and for future edits
  CREDITS.md          photo licenses
  PROGRESS.md         build log
  image-candidates/   photo search results and preview sheets
```

## Credits

Photos come from Wikimedia Commons under CC0, public domain, CC BY or CC BY-SA licenses. See [docs/CREDITS.md](docs/CREDITS.md). Fonts are Archivo, Martian Mono and Gochi Hand (SIL Open Font License), self-hosted via Fontsource.
