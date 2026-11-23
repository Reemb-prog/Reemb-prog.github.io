// Writes one new article with GitHub Models and saves it to articles/posts/.
// Run by .github/workflows/weekly-article.yml every Monday; can also run locally:
//
//   GITHUB_TOKEN=<token with models:read> node scripts/write-article.mjs
//
// Env:
//   GITHUB_TOKEN        token for https://models.github.ai (Actions provides it)
//   ARTICLE_MODEL       model id, default openai/gpt-4.1
//   ARTICLE_FALLBACK    model tried if the first fails, default openai/gpt-4.1-mini
//   ARTICLE_MOCK_FILE   read the model's reply from this file instead (for testing)
//   DRY_RUN=1           print the article instead of saving it
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { CATEGORIES, POSTS_DIR, TOPICS_FILE, readPosts, serializePost, slugify } from './articles-lib.mjs';

const ENDPOINT = 'https://models.github.ai/inference/chat/completions';
const MODEL = process.env.ARTICLE_MODEL || 'openai/gpt-4.1';
const FALLBACK = process.env.ARTICLE_FALLBACK || 'openai/gpt-4.1-mini';
const ROTATION = ['development', 'research', 'notes'];

// Links are kept only to these sites, so the model cannot invent citations.
const LINK_ALLOW = [
  'developer.mozilla.org',
  'react.dev',
  'nodejs.org',
  'www.typescriptlang.org',
  'nextjs.org',
  'vitest.dev',
  'playwright.dev',
  'zod.dev',
  'pytorch.org',
  'huggingface.co',
  'docs.python.org',
  'web.dev',
  'www.w3.org',
];

const SYSTEM = `You write articles for "Field notes", the blog of Reem Basho, a Computer Science senior at Rafic Hariri University in Saida, Lebanon. She is a software developer and team lead, and an early-career AI researcher.

Voice: first person, curious, warm, practical and plain. Short paragraphs. Concrete examples over abstractions. Questions are welcome; slogans and hype are not. No corporate tone, no "in today's fast-paced world", no "delve", no "unlock", no "game-changer", no emojis.

Honesty rules (strict):
- Do not invent personal experiences, anecdotes, clients, employers, results, numbers, quotes or statistics.
- You may mention only these true facts about Reem, and only when genuinely relevant: she leads four developers who each use an AI coding agent on one shared codebase (Next.js, TypeScript, Zod, Vitest, Playwright); she ran an adaptive ControlNet stopping experiment on Stable Diffusion 1.5; she tried LoRA fine-tuning of Qwen2.5-VL-3B on a Tesla T4; she self-studied Stanford CS229 and CS230 and took Stanford and Harvard CS197 (research methods); she built an Arabic-first Quran course app with 228 Vitest tests.
- Opinions and suggested approaches are fine in first person ("I prefer", "I would start by"). Otherwise, explain the topic itself.
- When something is uncertain or depends on context, say so.
- Do not cite papers, authors or URLs from memory. Only link to official documentation home pages if truly useful.

Content: genuinely useful to developers or students reading it. Explain the idea, show how to apply it (code where it helps, in fenced blocks with a language), cover pitfalls or limits, and end with a short section titled with an open question Reem still has.`;

function formatSpec(words = '1100 to 1500') {
  return `Reply in exactly this format and nothing else:

TITLE: <article title, 30 to 70 characters, specific, no clickbait, no colon-subtitle unless needed>
DESCRIPTION: <meta description, 120 to 158 characters, plain sentence that says what the reader will learn>
TAGS: <3 to 5 comma-separated tags>
---
<article body in Markdown: ${words} words; open with a 2 to 3 sentence introduction (no heading); then 4 to 7 sections with "## " headings; "### " allowed inside sections; no "# " heading; no title repeated at the top>`;
}

function pickTopic(topics, posts) {
  if (topics.queue.length) return { ...topics.queue[0], fromQueue: true };
  const last = posts[0]?.category;
  const next = ROTATION[(ROTATION.indexOf(last) + 1) % ROTATION.length] || 'development';
  return { title: null, category: next, angle: null, fromQueue: false };
}

function userPrompt(topic, posts) {
  const past = posts.map((p) => `- ${p.title}`).join('\n') || '- (none yet)';
  const subject = topic.title
    ? `Write an article titled roughly "${topic.title}".\nAngle: ${topic.angle || 'your choice, practical and specific'}`
    : `Choose a fresh, specific topic yourself in the "${CATEGORIES[topic.category]}" category (${
        {
          development: 'software engineering, web development, testing, tooling, working with AI coding agents',
          research: 'machine learning and AI research, evaluation, experiments, computer vision, multimodal models',
          notes: 'learning, research habits, studying computer science, working in small teams',
        }[topic.category]
      }). It must not overlap with the past titles below.`;
  return `${subject}
Category: ${CATEGORIES[topic.category]}

Past titles (do not repeat or closely overlap):
${past}

${formatSpec()}`;
}

async function callModel(model, messages) {
  if (process.env.ARTICLE_MOCK_FILE) return readFileSync(process.env.ARTICLE_MOCK_FILE, 'utf8');
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN is not set');
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, messages, temperature: 0.7, max_tokens: 4000 }),
  });
  if (!res.ok) throw new Error(`${model}: HTTP ${res.status} ${(await res.text()).slice(0, 300)}`);
  const json = await res.json();
  const text = json.choices?.[0]?.message?.content;
  if (!text) throw new Error(`${model}: empty reply`);
  return text;
}

/** Parse and check the model's reply. Throws with a reason the retry prompt can use. */
function parseReply(text) {
  const t = text
    .replace(/\r\n?/g, '\n')
    .trim()
    .replace(/^```(?:markdown|md)?\s*\n/, '').replace(/\n```\s*$/, '').trim();
  const m = /^TITLE:\s*(.+)\nDESCRIPTION:\s*(.+)\nTAGS:\s*(.+)\n-{3,}\s*\n([\s\S]+)$/.exec(t);
  if (!m) throw new Error('reply did not follow the TITLE / DESCRIPTION / TAGS / --- format');
  const title = m[1].trim().replace(/^["']|["']$/g, '');
  const description = m[2].trim().replace(/^["']|["']$/g, '');
  const tags = m[3]
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 5);
  let body = m[4].trim().replace(/^#\s+.*\n+/, '');

  const problems = [];
  if (title.length < 20 || title.length > 90) problems.push(`title is ${title.length} characters (want 30 to 70)`);
  if (description.length < 90 || description.length > 170) problems.push(`description is ${description.length} characters (want 120 to 158)`);
  if (tags.length < 2) problems.push('fewer than 2 tags');
  const words = body.replace(/```[\s\S]*?```/g, ' ').split(/\s+/).filter(Boolean).length;
  if (words < 850) problems.push(`body has ${words} words (want 1100 to 1500)`);
  if (words > 2400) problems.push(`body has ${words} words (too long)`);
  const h2 = (body.match(/^## /gm) || []).length;
  if (h2 < 4) problems.push(`only ${h2} "## " sections (want 4 to 7)`);
  if (/^# /m.test(body)) problems.push('body contains a "# " heading');
  if (/\b(as an ai|language model,? i|i am an ai|i'm an ai)\b/i.test(body)) problems.push('talks about being an AI');
  if (problems.length) throw new Error(problems.join('; '));

  // Keep links only to allowed documentation sites; others become plain text.
  body = body.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, (all, label, href) => {
    try {
      return LINK_ALLOW.includes(new URL(href).hostname) ? all : label;
    } catch {
      return label;
    }
  });
  return { title, description, tags, body };
}

async function write(topic, posts) {
  const messages = [
    { role: 'system', content: SYSTEM },
    { role: 'user', content: userPrompt(topic, posts) },
  ];
  const attempts = [MODEL, MODEL, FALLBACK];
  let lastErr;
  for (const model of attempts) {
    try {
      const reply = await callModel(model, messages);
      try {
        return { ...parseReply(reply), model };
      } catch (e) {
        lastErr = e;
        console.warn(`[${model}] rejected: ${e.message}`);
        messages.push({ role: 'assistant', content: reply });
        messages.push({ role: 'user', content: `That reply has problems: ${e.message}. Rewrite the whole article fixing them.\n\n${formatSpec()}` });
      }
    } catch (e) {
      lastErr = e;
      console.warn(`[${model}] failed: ${e.message}`);
    }
  }
  throw new Error(`could not produce a valid article: ${lastErr?.message}`);
}

function output(key, value) {
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);
}

/* ---------- Run ---------- */
const topics = JSON.parse(readFileSync(TOPICS_FILE, 'utf8'));
const posts = readPosts({ includeFuture: true });
const today = new Date().toISOString().slice(0, 10);

if (posts.some((p) => p.date === today && p.generated)) {
  console.log(`an article was already generated today (${today}); nothing to do`);
  output('published', 'false');
  process.exit(0);
}

const topic = pickTopic(topics, posts);
console.log(`topic: ${topic.title ?? `(model picks, ${topic.category})`} · model: ${MODEL}`);
const art = await write(topic, posts);

let slug = slugify(art.title);
const taken = new Set(posts.map((p) => p.slug));
for (let n = 2; taken.has(slug); n++) slug = `${slugify(art.title)}-${n}`;

const post = {
  title: art.title,
  description: art.description,
  date: today,
  category: topic.category,
  tags: art.tags,
  slug,
  generated: art.model,
  body: art.body,
};
const file = resolve(POSTS_DIR, `${today}-${slug}.md`);

if (process.env.DRY_RUN) {
  console.log(serializePost(post));
} else {
  writeFileSync(file, serializePost(post));
  if (topic.fromQueue) {
    const [done] = topics.queue.splice(0, 1);
    topics.used.unshift({ ...done, slug, date: today });
    writeFileSync(TOPICS_FILE, `${JSON.stringify(topics, null, 2)}\n`);
  }
  console.log(`wrote ${file}`);
}
output('published', process.env.DRY_RUN ? 'false' : 'true');
output('slug', slug);
output('title', art.title.replace(/[\r\n]/g, ' '));
