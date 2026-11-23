# Design system · contact sheet, two lenses

Recorded from the built site (`src/index.css`, `src/components/`). Change the code first, then update this file.

## World

A photographer's contact sheet. Projects are frames on 35 mm film with sprocket holes and edge print. Selection is a hand-drawn grease-pencil loop. Notes and questions are written in the margin. The two lenses are two kinds of light on the same sheet.

| | Build lens (light table) | Research lens (darkroom) |
|---|---|---|
| Ground | `#e9ecea`, white glow from the top | `#170d0b`, oxblood glow `#4a1a10` |
| Ink / secondary / muted | `#121314` / `#3f4446` / `#5b6164` | `#f3dfcf` / `#dcbfa9` / `#b8927c` |
| Rules | `#c9cfcc` | `#4a2a20` |
| Mark (grease pencil) | chinagraph blue `#1f43c7` | chinagraph yellow `#ffc53d` |
| Photos | grayscale + slight contrast | grayscale, safelight sepia |

Shared film materials: base `#131110`, edge print `#dcc79b` / dim `#9d8c6c`, grease pencil on film `#7fa2ff` (build) / `#ffd84a` (research). The questions band is always night (`#0b0908` over a dimmed star photo, questions in `#ffd84a`).

Colour strategy: restrained ground with one mark colour per lens; the film strip and the night band carry the dark masses. Colours transition over 600 ms when the lens changes.

## Type

| Role | Face | Settings |
|---|---|---|
| Display (name, section titles) | Archivo Variable | weight 740–820, width 112–125, tracking −0.02 to −0.035em |
| Body | Archivo Variable | 17px / 1.6, width 100, measure ≤ 62ch |
| Margin notes, questions, step numbers | Gochi Hand | colour = mark |
| Edge print, dates, counters (data only) | Martian Mono Variable | 11px, width 80, uppercase, +0.06em, tabular figures |

Scale: name `clamp(3rem, 7.4vw, 5.4rem)`; section title `clamp(2.25rem, 5.4vw, 4.25rem)`; project title `clamp(2rem, 4vw, 3.25rem)`.

## Components

- **Film strip**: sprocket rows are CSS masks over the film colour, so the holes show the page ground in either lens. Frames are 3:2, `clamp(210px, 19.5vw, 300px)` wide (72vw on phones), with a frame number and title in the edge print below. Drag, swipe or arrow buttons; scroll-snap.
- **Loupe**: a 150px round magnifier (2.4×, in colour) that follows the mouse over a frame. Hidden on touch.
- **Print**: a photo on a white (build) or warm (research) border with a handwritten caption, slightly rotated (−1.2° to 1.6°), soft two-layer shadow.
- **Circle mark**: authored SVG loop that overshoots its start, drawn on in 550 ms. Marks the selected frame and the chosen lens.
- **Lens chooser**: two large buttons (icon, name, who it's for); the chosen one gets the circle mark. Mini segmented toggle in the header with a sliding thumb.
- **Buttons**: 44px minimum height, 6px radius, ink fill → mark fill on hover; ghost variant with a 35% ink border.
- **Stack tags**: 4px radius, 1px rule border, small text.
- **Lists of facts / numbers**: hairline rules between rows, no cards.

## Motion

Ease-out `cubic-bezier(0.16, 1, 0.3, 1)`. One idea per moment:

- **The opening** (`src/components/Intro.tsx`, about 5 s, once per tab, skipped by any click, key, wheel or touch): two labelled collaborator cursors, "Reem · build" (`#1f43c7`) and "Reem · research" (`#ffc53d`), assemble the real hero. Build draws a selection box (with a size tag) and the name stretches in (`wdth` 62 → 125); a caret types the headline; Research drops the Build card and alt-drags its twin into the Research slot; the film peeks in from the right, gets grabbed at its leading edge and pulled home, then the frames develop; Build writes "Who's looking?" and traces the grease-pencil circle around frame 01 (skipped when frame 01 is below the fold); each cursor ends pointing at its own lens card and hands over. It animates the live DOM with WAAPI and cancels to the normal CSS, so a skip is instant and a script failure shows the page after 6 s. `?intro-debug` freezes it and exposes `window.__introSeek(ms)`. Footer "Replay the opening" plays it again.
- **Light through the name**: letters near the pointer thin and narrow (`wght` 820 → 350, `wdth` 125 → 87), then settle (fine pointers only).
- **Cursor ring**: a 30px chinagraph ring trails the pointer; it says "drag" on the film, hides under the loupe and swells over controls (fine pointers only; the native cursor stays).
- **Scroll**: section titles develop (blur 14px + loose tracking → sharp); prints drop onto the table (rotate 7°, lift, settle); list rows rise in a capped 60 ms stagger; questions are written on left to right (clip-path); numbers count up; the hero lifts away, the star photo drifts and the closing photo slowly settles from 1.22× zoom.
- photos develop from overexposed (1.4 s, staggered 90 ms)
- lens flicker (620 ms, stepped), with the world swapping at 90 ms
- frames re-order with spring layout (stiffness 260, damping 30)
- the project panel cross-fades with a 6px blur
- grease-pencil marks draw on

Everything collapses under `prefers-reduced-motion`.

## Layout

Max width 1320px, gutter `clamp(16px, 4vw, 56px)`. Sections are spaced by `clamp(80px, 12vw, 160px)`. Two-column splits (photo/print beside text) collapse to one column below 980px; the header nav hides below 980px, leaving name, lens toggle and CV.

## Browser surfaces

Selection, focus ring, scrollbar and underline colour all come from the lens tokens (`--mark`, `--rule`, `--ground`).
