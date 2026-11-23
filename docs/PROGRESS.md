# Progress log

## 2026-11-22 — session 1 (paused at the 5-hour limit)

- Read the CV. Owner decisions: the visitor picks the lens ("Who's looking?"), the only links are GitHub and LinkedIn, the site shows the email and a PDF CV download, and there's no personal photo.
- Wrote `PRODUCT.md`. Locked the direction **"Contact sheet, two lenses"** (contract in `.impeccable/surfaces/index-html.md`).
- Scaffolded Vite + React + TS; collected photo candidates from Wikimedia Commons.

## 2026-11-22 — session 2 (built)

- Picked and optimised 18 photos (WebP, about 640 KB); credits are in `docs/CREDITS.md` and the site footer. Dropped one candidate (a historical prisoner album) as unsuitable for a memory-book project.
- `src/data/content.ts`: all copy for both lenses, from the CV only.
- Built: header with lens toggle and CV, hero with lens chooser, film strip (drag, loupe, developing photos, keys 1–9), project panel with question / what I did / numbers / honest note / stack, about, now (PanelCare harness steps), questions band (each opens its project and switches lens if needed), learning log, toolkit, recognition, contact, footer credits.
- Exported the CV to `public/cv/Reem-Basho-CV.pdf` with Word.
- Checked at 1440×900 and 390×844 in both lenses: no horizontal overflow, no console errors. The impeccable detector found nothing. Fixed contrast of the dimmed learning rows.
- Initial JS is 106 KB gzipped (motion features are lazy-loaded).
- Added the GitHub Pages workflow, README, DESIGN.md and docs/DECISIONS.md.

## 2026-11-23 — session 3 (a more impactful opening)

- Added the opening: two collaborator cursors build the hero in front of the visitor (selection box, typed headline, alt-dragged lens card, pulled-in film, traced circle), then hand over. Once per tab, skippable, off under reduced motion.
- Added the name reacting to the pointer, a contextual cursor ring, and scroll motion (titles develop, prints drop, rows rise, questions write on, numbers count up, parallax on the star and closing photos).
- Checked at 1440×900 and 375×812, both lenses, no console errors. Initial JS is now about 116 KB gzipped.

### Open items for the owner

- Optional: separate CV PDFs per lens (see README → Editing content).
- Push to GitHub and set Pages → Source to "GitHub Actions".
