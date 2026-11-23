// Shared helpers for the articles: reading posts, front matter, slugs.
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export const ROOT = resolve(import.meta.dirname, '..');
export const POSTS_DIR = resolve(ROOT, 'articles/posts');
export const TOPICS_FILE = resolve(ROOT, 'articles/topics.json');
export const CATEGORIES = { development: 'Development', research: 'Research', notes: 'Notes' };

/** Site address from .env (VITE_SITE_URL), overridable by the environment. */
export function siteUrl() {
  if (process.env.VITE_SITE_URL) return process.env.VITE_SITE_URL.replace(/\/$/, '');
  try {
    const env = readFileSync(resolve(ROOT, '.env'), 'utf8');
    const m = /^VITE_SITE_URL=(.+)$/m.exec(env);
    if (m) return m[1].trim().replace(/\/$/, '');
  } catch {
    /* fall through */
  }
  return 'https://reemb-prog.github.io';
}

export function slugify(s) {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72)
    .replace(/-+$/, '');
}

/** Minimal front matter: `key: value` lines between --- fences; tags are comma separated. */
export function parsePost(raw, file = '') {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw);
  if (!m) throw new Error(`${file}: missing front matter`);
  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(':');
    if (i < 0) continue;
    const k = line.slice(0, i).trim();
    let v = line.slice(i + 1).trim();
    if (/^".*"$/.test(v)) v = JSON.parse(v);
    data[k] = v;
  }
  for (const k of ['title', 'description', 'date', 'category']) {
    if (!data[k]) throw new Error(`${file}: front matter needs "${k}"`);
  }
  if (!CATEGORIES[data.category]) throw new Error(`${file}: unknown category "${data.category}"`);
  const tags = (data.tags || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
  const body = m[2].trim();
  const words = body.replace(/```[\s\S]*?```/g, ' ').split(/\s+/).filter(Boolean).length;
  return {
    ...data,
    tags,
    slug: data.slug || slugify(data.title),
    body,
    words,
    minutes: Math.max(1, Math.round(words / 220)),
    draft: data.draft === 'true',
  };
}

export function serializePost(p) {
  const q = (s) => JSON.stringify(s);
  return [
    '---',
    `title: ${q(p.title)}`,
    `description: ${q(p.description)}`,
    `date: ${p.date}`,
    `category: ${p.category}`,
    `tags: ${p.tags.join(', ')}`,
    `slug: ${p.slug}`,
    p.generated ? `generated: ${p.generated}` : null,
    '---',
    '',
    p.body.trim(),
    '',
  ]
    .filter((l) => l !== null)
    .join('\n');
}

/** All published posts, newest first. Future-dated and draft posts are skipped. */
export function readPosts({ includeFuture = false } = {}) {
  let files = [];
  try {
    files = readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md'));
  } catch {
    return [];
  }
  const today = new Date().toISOString().slice(0, 10);
  const posts = files.map((f) => ({ ...parsePost(readFileSync(resolve(POSTS_DIR, f), 'utf8'), f), file: f }));
  const seen = new Set();
  for (const p of posts) {
    if (seen.has(p.slug)) throw new Error(`duplicate slug "${p.slug}"`);
    seen.add(p.slug);
  }
  return posts
    .filter((p) => !p.draft && (includeFuture || p.date <= today))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug.localeCompare(b.slug)));
}
