# Design decisions

Why the portfolio looks and behaves the way it does. Product facts are in [../PRODUCT.md](../PRODUCT.md); the visual system is in [../DESIGN.md](../DESIGN.md).

## Who skims it, and what they need first

| Reader | Time | What they look for | Where it is |
|---|---|---|---|
| HR / recruiter | 10–30 s | Name, focus, degree, location, contact, CV file | Hero (name, role, university), header CV button, About facts list, contact section |
| Senior developer / manager | 30–90 s | Shipped products, testing discipline, leadership, stack | Build lens strip, test counts in "In numbers", the "Now" harness steps |
| Researcher / professor | 30–90 s | Method, honest results, coursework lineage | Research lens strip, each project's question, numbers and honest note, the learning log |

So the order is: **identity → choose a lens → the work → who I am → what I'm doing now → the questions I ask → how I learn → tools → contact.** The work comes before the biography because this is a portfolio: a skimmer should see projects in the first viewport.

## Why two lenses instead of two pages

One person, two angles. The lens never invents content. It reorders projects, rewrites the role line and pitch, marks the relevant learning rows, and sorts skills. Projects that belong to both (RHU Catalog Explorer, VentureForge AI) appear in both. A visitor can share a lens with `?lens=research`.

The visitor chooses ("Who's looking?") rather than the site guessing, because the owner wanted the visitor to pick. The choice is a large, obvious control in the hero, not a modal wall: the page is already usable underneath, in the Build lens, before anyone chooses.

## Why a contact sheet

The concept: a curious person examining their own work. A contact sheet is where a photographer looks at every frame, picks the good ones with a grease pencil and writes notes in the margin. That maps directly onto:

- **frames** → projects on a draggable strip (the carousel)
- **grease-pencil circle** → the selected project
- **margin notes** → Reem's questions, in a handwritten face
- **loupe** → hover to see a frame in colour, up close
- **light table vs darkroom** → the two lenses, literally different light

It avoids the default "hero + card grid + timeline" developer portfolio, while every part still works as a normal page: real headings, buttons, links and lists.

## Voice

First person, curious, a little playful, and never inflated. The owner's own words set the tone: passionate learner, curious researcher, thirsts for learning, questions the world. That's why:

- the headline is "I question things, then I build something to find out."
- every project opens with **the question it chased**
- research projects end with an **honest note** about what didn't work (the router picking step 29, weak visual grounding in the Qwen trial, VentureForge paused at Phase 1)
- section titles talk like a person ("A thirst I don't plan to cure", "Ask me something.")

Nothing is claimed that isn't in the CV. No testimonials, no GPA, no live URLs (the owner chose to link only GitHub and LinkedIn).

## Imagery

No personal photo (owner's choice). Instead there are real photographs that stand for each project: a pencil sketch for ControlNet (edges), a card catalogue for the catalogue chatbot, a mosque interior for the Quran course app, a microphone for speech emotion recognition, Saida's Sea Castle for "about" and the close. They print in black and white (or safelight sepia) and bloom into colour when picked, like a print developing. Two projects without a fitting photo get drawn figures instead (a detector counting pills, a shared-expense ledger), so nothing uses a filler stock image.

## Motion, used once and on purpose

- **Developing**: photos fade up from overexposed white when the strip loads or the lens changes.
- **Lens flicker**: a quick lamp-off flicker, then the new light. The colours swap at the darkest moment.
- **Grease pencil**: circles, underlines and arrows draw on.
- **Re-printing**: frames shared by both lenses slide to their new position (FLIP layout animation).

All of it turns off under `prefers-reduced-motion`.

## Performance

- Initial JS is about 116 KB gzipped (106 KB before the opening and scroll motion were added). The animation library's layout features load as a separate chunk.
- 18 photos as WebP total about 640 KB, lazy-loaded except the first frames.
- Fonts are self-hosted and split by unicode range, so only the Latin subset downloads.
- No backend, no analytics, no external requests at runtime.

## Accessibility

- Keyboard: every frame, lens option and question is a real button. `1`–`9` jump to frames. Visible focus ring in the accent colour.
- Selection uses stroke form (a drawn circle) as well as colour, and `aria-current` / `aria-pressed` for screen readers.
- The project panel is an `aria-live` region, so switching frames is announced.
- Text contrast meets WCAG AA in both lenses (body text ≥ 4.5:1, checked per lens). Learning-log rows outside the current lens are muted with a colour that still passes AA, not with opacity.
- A skip link goes straight to the projects.
