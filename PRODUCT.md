# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React (user-pinned), static build, no backend. Vite + React + TypeScript chosen by Claude (delegated detail). Deployed by the owner to GitHub Pages via a GitHub Actions workflow.

## Users

- **Primary:** people evaluating Reem Basho for a role, in a quick skim (30–90 seconds), often from a link in a CV, LinkedIn or an email:
  - HR / recruiters: need name, focus, availability, education, contact and a downloadable CV fast.
  - Senior developers / engineering managers: want proof of shipped software, stack depth, testing discipline, team leadership.
  - Researchers / professors / lab leads: want research methods, experiments with honest numbers, coursework lineage (Stanford/Harvard CS197, CS229, CS230).
- **Secondary:** peers and classmates browsing for fun.

## Product Purpose

A personal portfolio and interactive CV for Reem Basho, an AI-focused Computer Science senior at Rafic Hariri University (Lebanon, 2024–2027). It must present two lenses of the same person: **software development** and **AI research**, switchable at any time. Success = a skimmer leaves knowing who Reem is, what she can do, and how to contact her, and wants to read one more project.

## Positioning

Reem is both a builder who ships tested products with AI agent harnesses (she leads a four-developer team coordinating parallel Claude Code and Codex sessions) and a curious researcher who runs small, honest experiments and reports their limits. The site's mechanism: one person, two lenses, the visitor picks which one they came for.

## Operating Context

- Visitor decides their lens on arrival ("who's looking?"), and can toggle later.
- All facts come from the CV `Reem Basho CV - Nov 2026.docx` (owner's documents). Content lives in one data file.
- Contact: RHU student email, GitHub `Reemb-prog`, LinkedIn `reem-basho`. PDF CV download per lens (owner drops PDFs into `public/cv/`).

## Capabilities and Constraints

- Static only. No backend, no analytics, no paid services. Everything free.
- No personal photo of Reem (owner's explicit choice). Imagery must be real photographs (not vector illustrations), freely licensed, and expressive rather than decorative.
- No live project URLs: link only GitHub and LinkedIn (owner's choice). Client and app projects are described, not linked.
- Lightweight: fast load, small JS.

## Brand Commitments

- **Voice (owner's words, binding):** passionate learner, curious researcher, thirsts for learning, questions the world. Light, warm, playful, not rigid or corporate. First person.
- Must not look AI vibe-coded; should feel designed, Figma-level, animated.

## Evidence on Hand

- CV facts: 15 projects, team-lead role (PanelCare, TechTalks internship, Nov 2026), coursework, LCPC 2026 participation, MOS 2nd place nationally (2019, 2020), RHU Web Development Competition winner (May 2024) and CS scholarship.
- Real numbers: 228 Vitest tests (Baraem), ~104 tests (Memory Book Studio), ~108 Playwright tests (Leila Hneini site), 429-page catalog (RHU Catalog Explorer), 60 generations / 30 cases × 2 seeds (ControlNet), LoRA r=16 on Tesla T4 (Qwen2.5-VL).
- Absent, must not be fabricated: testimonials, employer logos, GPA, publications, live URLs.

## Product Principles

1. Skim first: the essentials survive a 10-second look.
2. Two honest lenses, one person: switching lens reorders and reframes, never invents.
3. Show the thinking: research is presented with its question, method and honest limit.
4. Curiosity is the brand: questions, not slogans.
5. Light to load, fun to touch.

## Accessibility & Inclusion

WCAG 2.1 AA contrast, full keyboard use of toggle and carousel, `prefers-reduced-motion` respected.
