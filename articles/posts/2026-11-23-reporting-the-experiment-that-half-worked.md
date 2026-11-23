---
title: "Reporting the experiment that only half worked"
description: "An adaptive ControlNet stopping experiment found room to save steps, then my router refused to use it. Here is how I report a result like that honestly."
date: 2026-11-23
category: research
tags: diffusion models, ControlNet, research methods, experiments
slug: reporting-the-experiment-that-half-worked
---

Most of my experiments end somewhere between "it worked" and "it didn't." This is about one of those, and about how I try to write up a result that is real, interesting and not the result I hoped for.

## The question

ControlNet guides a diffusion model with a structural hint, like the edges of a sketch. By default it runs at every denoising step. But by the later steps the image usually already has its structure, and the remaining steps mostly refine texture and detail.

So the question was simple: **if the picture already has its structure by step 24, does it still need ControlNet until step 30?** Stopping early would save compute, as long as the output stays faithful to the guide.

## The setup

I used Stable Diffusion 1.5 with a Canny-edge ControlNet and a DDIM sampler over 30 steps. I compared four strategies:

- **Full control:** ControlNet on for all 30 steps, the reference.
- **Fixed stop:** turn it off at a chosen step.
- **Gradual decay:** fade its strength out.
- **Adaptive stop:** decide per image, without any training, when control is no longer needed.

The adaptive version needed signals that say "structure has settled." I tried several: how consistent the edge-F1 score stays between steps, how much the low-frequency part of the latent is still changing, the size and trend of the ControlNet residual, the share of that residual in high frequencies, a rolling slope, and the drop from the best score so far.

## Defining "good enough" before looking

The most useful decision came before any results: what counts as a safe early stop?

I set two limits against the full-control reference. Edge-F1 could drop by at most **0.02**, and CLIP similarity by at most **0.01**. Any stop inside both limits counts as safe. Anything outside does not, however good it looks.

Writing those numbers down first matters. Without them, it is very tempting to look at a slightly worse image and decide it is "basically the same." With them, the experiment can say no.

## The oracle says there is room

To know how much room exists at all, I built counterfactual oracle labels. For each case, I ran every possible stopping step and found the earliest one that stayed inside the safety limits. That is the best any stopping rule could do, with perfect hindsight.

Across 60 reference generations (30 cases, two seeds each), the oracle needed on average **27.5** ControlNet steps instead of 30. So the room is real, but modest: about two and a half steps per image, on average.

## The router did not take it

Then I trained a small sequential router to predict, step by step, whether it was safe to stop. On held-out cases, it chose **step 29**.

That is a result, and it is not the one I wanted. The router stays inside the safety limits, but it barely saves anything. It learned to play it safe.

## How I write that up

Here is the honest version of the finding, in the form I would put at the top of a report:

> An oracle shows that adaptive ControlNet stopping can save about 2.5 of 30 steps on average within strict quality limits. A sequential router I built does not yet capture that saving: it stops at step 29 on held-out cases.

A few rules I follow when writing results like this:

1. **Lead with what the data supports**, not with what the method was meant to show. The oracle result and the router result are both findings.
2. **Give the bar and the number together.** "Step 29" means little without "within edge-F1 loss ≤ 0.02 and CLIP loss ≤ 0.01."
3. **Separate the ceiling from the achievement.** The oracle is an upper bound, not something the method did. Mixing the two is the easiest way to overclaim.
4. **Say what was small.** Sixty generations on one model and one control type is a pilot, not a benchmark.
5. **Name the next question** instead of hiding the gap.

## What I would try next

The router's caution probably comes from the signals, not the idea. Some of them react late, and a router trained to never break the limits will wait for the slowest one. Next I would look at which single signal best predicts the oracle's step, test whether a per-image threshold beats a learned router, and repeat the whole thing with a different control type, like depth, where structure may settle at a different pace.

The experiment did not save the steps it was looking for. It did show, with numbers, that the steps are there to be saved. That is worth writing down exactly as it is.
