---
title: "Write the harness before the code: four AI agents, one codebase"
description: "How I set up rules, contracts and gates so four developers, each driving an AI coding agent, can build one product in parallel without colliding."
date: 2026-11-23
category: development
tags: AI coding agents, team workflow, testing, Claude Code, Codex
slug: write-the-harness-before-the-code
---

Four developers, four AI coding agents, one repository, four weeks. The obvious risk is not that the agents write bad code. It is that they write *reasonable* code in four slightly different directions, and you find out at merge time.

So before anyone wrote a feature, I wrote the harness: the rules, contracts and gates that every agent works inside. This is how it is set up, and why each piece is there.

## The problem is drift, not quality

A single developer with an AI agent can keep the whole picture in their head. They notice when the agent invents a new date format or a second way to fetch data. Spread that across four people and the picture splits.

Each agent is locally sensible. One adds a helper that already exists under a different name. Another changes an API response shape because it made a component simpler. A third writes tests against the new shape. None of this is wrong in isolation. Together it is a week of untangling.

The fix is not to review harder at the end. It is to make the right path the easy path from the start, so the agent never has to guess.

## Status lives in one place, rules live in the repo

I split the project's memory in two:

- **Jira holds the status.** Every work item has a stable ID mapped to its Jira key, plus an owner, a reviewer, story points and its blocking dependencies. That is where "who is doing what, and what waits on what" lives.
- **The repository holds the rules.** Shared `CLAUDE.md` and `AGENTS.md` files describe conventions, the product scope, the design blueprint and a decision log. Typed API contracts sit next to the code.

The split matters because agents read the repository, not your project board. If a decision only exists in a meeting or a ticket comment, the agent will never see it. If it is in the decision log, every session starts with it.

The decision log also has change-request control. Changing a contract is allowed, but it is a recorded decision with a reason, not a side effect of someone's prompt.

## One branch per item, with its limits attached

Each work item gets its own branch, started from the current `main`. A small Node.js CLI does this, and it hands the agent two things up front:

1. The item's **acceptance criteria**, so "done" is defined before the first line.
2. The item's **allowed file paths**, so the agent knows which part of the codebase is its job.

That second list does a lot of quiet work. An agent fixing the dispatch screen has no reason to touch the authentication module. If it does, that is a signal worth looking at, not a refactor to wave through.

A simplified, illustrative hand-off looks like this:

```text
branch: feat/PC-14-maintenance-plans
acceptance:
  - coordinator can create a recurring plan for a site
  - plan generates visits for the next 90 days
allowed paths:
  - src/features/plans/**
  - src/lib/contracts/plans.ts (read only)
```

## Plan before code, with a line for human sign-off

Agents plan before they write. For routine work, the plan is self-approved and the agent continues. For a small set of changes, a human signs off first:

- API contract or database schema changes
- anything touching authentication
- deployment configuration
- edits outside the allowed paths

This keeps the fast path fast. Most items never hit the line. The ones that do are exactly the ones where a confident wrong guess is expensive.

## Tests ship with the code

Every item ends the same way. The agent writes tests alongside the code, runs only the affected tests rather than the whole suite on every change, and finishes with a short review guide and a pull request description.

Then a different developer reviews it. Not the author, and not the author's agent. The review guide tells them where to look first, which turns a vague "LGTM" into an actual check.

The stack here is TypeScript with Next.js, Zod for runtime validation at the boundaries, Vitest for unit tests and Playwright for end-to-end flows. Zod is doing more than validation: it makes the contracts executable, so an agent that drifts from the agreed shape fails loudly in a test instead of quietly in production.

## What the harness does not solve

It would be easy to oversell this, so here is what it does not do.

It does not make agents understand the product. They follow the rules they are given, and the rules are only as good as what I wrote down. Gaps in the blueprint show up as confident guesses.

It does not remove review. It makes review smaller and more focused, which is different.

And it costs time up front. Writing contracts, path lists and acceptance criteria before any feature exists feels slow in week one. The payoff comes in weeks three and four, when four branches merge and mostly agree with each other.

## The question I am still asking

Can four agents build one product without stepping on each other? So far the answer is "mostly, if the boundaries are written down." The interesting part is the word *mostly*: which collisions still get through, and whether a better harness can catch them, or whether some of them only a human ever will.
