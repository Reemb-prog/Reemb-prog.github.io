// Builds the static /articles section, the RSS feed, sitemap.xml, robots.txt
// and 404.html into dist/. Runs after the portfolio build (see package.json).
import { copyFileSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Marked } from 'marked';
import { CATEGORIES, ROOT, readPosts, siteUrl, slugify } from './articles-lib.mjs';

const SITE = siteUrl();
const DIST = resolve(ROOT, 'dist');
const OUT = resolve(DIST, 'articles');
const PER_PAGE = 12;
const AUTHOR = {
  name: 'Reem Basho',
  github: 'https://github.com/Reemb-prog',
  linkedin: 'https://www.linkedin.com/in/reem-basho/',
};
const SECTION = {
  name: 'Field notes',
  title: 'Field notes · Articles on development and AI research by Reem Basho',
  description:
    'Practical articles on software development, AI research and the questions in between, written by Reem Basho, a Computer Science student and developer in Lebanon.',
};

const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const unesc = (s = '') =>
  s.replace(/&(amp|lt|gt|quot|#39);/g, (_, e) => ({ amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'" })[e]);
const fmtDate = (d) =>
  new Date(`${d}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const url = (path) => `${SITE}${path}`;

/* ---------- Markdown: heading ids for the table of contents ---------- */
function renderBody(md) {
  const toc = [];
  const used = new Set();
  const marked = new Marked({
    gfm: true,
    renderer: {
      heading({ tokens, depth }) {
        const html = this.parser.parseInline(tokens);
        const text = unesc(html.replace(/<[^>]+>/g, ''));
        let id = slugify(text) || 'section';
        while (used.has(id)) id += '-x';
        used.add(id);
        if (depth === 2) toc.push({ id, text });
        const level = Math.max(2, depth); // the page title is the only h1
        return `<h${level} id="${id}"><a class="anchor" href="#${id}" aria-hidden="true" tabindex="-1">#</a>${html}</h${level}>\n`;
      },
      link({ href, title, tokens }) {
        const text = this.parser.parseInline(tokens);
        const external = /^https?:\/\//.test(href) && !href.startsWith(SITE);
        const t = title ? ` title="${esc(title)}"` : '';
        return `<a href="${esc(href)}"${t}${external ? ' rel="noopener"' : ''}>${text}</a>`;
      },
      image({ href, title, text }) {
        const t = title ? ` title="${esc(title)}"` : '';
        return `<img src="${esc(href)}" alt="${esc(text)}"${t} loading="lazy" decoding="async">`;
      },
    },
  });
  const html = marked.parse(md.replace(/^#\s+.*\n+/, ''));
  return { html, toc };
}

/* ---------- Page shell ---------- */
function page({ title, description, path, type = 'website', image = '/articles/og.jpg', jsonld, head = '', body, published, modified, tags = [] }) {
  const canonical = url(path);
  const meta = [
    `<meta property="og:type" content="${type}">`,
    `<meta property="og:site_name" content="${SECTION.name} · Reem Basho">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(description)}">`,
    `<meta property="og:url" content="${canonical}">`,
    `<meta property="og:image" content="${url(image)}">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta property="og:locale" content="en_US">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(title)}">`,
    `<meta name="twitter:description" content="${esc(description)}">`,
    `<meta name="twitter:image" content="${url(image)}">`,
  ];
  if (published) {
    meta.push(`<meta property="article:published_time" content="${published}T08:00:00Z">`);
    meta.push(`<meta property="article:modified_time" content="${modified || published}T08:00:00Z">`);
    meta.push(`<meta property="article:author" content="${AUTHOR.linkedin}">`);
    for (const t of tags) meta.push(`<meta property="article:tag" content="${esc(t)}">`);
  }
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="author" content="${AUTHOR.name}">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="${canonical}">
<meta name="theme-color" content="#f3f1ec" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#170d0b" media="(prefers-color-scheme: dark)">
${meta.join('\n')}
<link rel="alternate" type="application/rss+xml" title="${SECTION.name} by Reem Basho" href="${url('/articles/feed.xml')}">
<link rel="icon" type="image/svg+xml" href="/articles/icon.svg">
<link rel="preload" href="/articles/fonts/archivo.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/articles/style.css">
${head}
<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, '\\u003c')}</script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="top">
  <div class="wrap top-inner">
    <a class="mark" href="/articles/">${SECTION.name}</a>
    <nav aria-label="Articles"><a href="/articles/">All articles</a><a href="/articles/feed.xml">RSS</a></nav>
  </div>
</header>
<main id="main">
${body}
</main>
<footer class="foot">
  <div class="wrap foot-inner">
    <p>Written by ${AUTHOR.name}. A new note most Mondays.</p>
    <p><a href="${AUTHOR.github}" rel="me noopener">GitHub</a> · <a href="${AUTHOR.linkedin}" rel="me noopener">LinkedIn</a> · <a href="/articles/feed.xml">RSS</a></p>
  </div>
</footer>
</body>
</html>
`;
}

const authorLd = {
  '@type': 'Person',
  '@id': `${SITE}/#reem`,
  name: AUTHOR.name,
  url: AUTHOR.github,
  sameAs: [AUTHOR.github, AUTHOR.linkedin],
};
const blogLd = { '@type': 'Blog', '@id': `${SITE}/articles/#blog`, name: SECTION.name, url: url('/articles/'), inLanguage: 'en', author: authorLd };

const meta = (p) =>
  `<p class="meta mono"><time datetime="${p.date}">${fmtDate(p.date)}</time><span>${p.minutes} min read</span><span>${CATEGORIES[p.category]}</span></p>`;

/* ---------- Index pages ---------- */
function indexPages(posts) {
  const pages = Math.max(1, Math.ceil(posts.length / PER_PAGE));
  for (let n = 1; n <= pages; n++) {
    const slice = posts.slice((n - 1) * PER_PAGE, n * PER_PAGE);
    const path = n === 1 ? '/articles/' : `/articles/page/${n}/`;
    const list = slice.length
      ? `<ol class="list" start="${(n - 1) * PER_PAGE + 1}">
${slice
  .map(
    (p, i) => `<li>
  <span class="num mono" aria-hidden="true">${String((n - 1) * PER_PAGE + i + 1).padStart(2, '0')}</span>
  <div>
    <h2><a href="/articles/${p.slug}/">${esc(p.title)}</a></h2>
    <p class="excerpt">${esc(p.description)}</p>
    ${meta(p)}
  </div>
</li>`,
  )
  .join('\n')}
</ol>`
      : `<p class="empty">The first note is on its way.</p>`;
    const nav =
      pages > 1
        ? `<nav class="pager" aria-label="Pages">${n > 1 ? `<a rel="prev" href="${n === 2 ? '/articles/' : `/articles/page/${n - 1}/`}">← Newer</a>` : '<span></span>'}<span class="mono">Page ${n} of ${pages}</span>${n < pages ? `<a rel="next" href="/articles/page/${n + 1}/">Older →</a>` : '<span></span>'}</nav>`
        : '';
    const title = n === 1 ? SECTION.title : `${SECTION.name} · page ${n} · Reem Basho`;
    const body = `<section class="wrap intro">
  <h1>${SECTION.name}</h1>
  <p class="lede">Practical notes on building software, running small AI experiments, and the questions I keep asking along the way.</p>
</section>
<section class="wrap" aria-label="Articles">
${list}
${nav}
</section>`;
    const jsonld = {
      '@context': 'https://schema.org',
      '@graph': [
        { ...blogLd, blogPost: slice.map((p) => ({ '@id': url(`/articles/${p.slug}/#article`) })) },
        {
          '@type': 'CollectionPage',
          url: url(path),
          name: title,
          isPartOf: { '@id': `${SITE}/articles/#blog` },
        },
      ],
    };
    const dir = n === 1 ? OUT : resolve(OUT, 'page', String(n));
    mkdirSync(dir, { recursive: true });
    writeFileSync(resolve(dir, 'index.html'), page({ title, description: SECTION.description, path, jsonld, body }));
  }
  return pages;
}

/* ---------- Article pages ---------- */
function articlePage(p, posts) {
  const { html, toc } = renderBody(p.body);
  const path = `/articles/${p.slug}/`;
  const more = posts.filter((q) => q.slug !== p.slug).slice(0, 3);
  const tocHtml =
    toc.length >= 3
      ? `<nav class="toc" aria-label="In this article"><p class="mono">In this article</p><ol>${toc.map((t) => `<li><a href="#${t.id}">${esc(t.text)}</a></li>`).join('')}</ol></nav>`
      : '';
  const body = `<article class="wrap post" itemscope itemtype="https://schema.org/BlogPosting">
  <header class="post-head">
    <p class="crumbs mono"><a href="/articles/">${SECTION.name}</a> / ${CATEGORIES[p.category]}</p>
    <h1 itemprop="headline">${esc(p.title)}</h1>
    <p class="deck" itemprop="description">${esc(p.description)}</p>
    <p class="byline">By <span itemprop="author">${AUTHOR.name}</span></p>
    ${meta(p)}
  </header>
  ${tocHtml}
  <div class="prose" itemprop="articleBody">
${html}
  </div>
  ${p.tags.length ? `<ul class="tags" aria-label="Tags">${p.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
</article>
${
  more.length
    ? `<aside class="wrap more" aria-labelledby="more-title">
  <h2 id="more-title">More field notes</h2>
  <ol class="list compact">
${more.map((q) => `<li><div><h3><a href="/articles/${q.slug}/">${esc(q.title)}</a></h3>${meta(q)}</div></li>`).join('\n')}
  </ol>
</aside>`
    : ''
}`;
  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        '@id': url(`${path}#article`),
        mainEntityOfPage: url(path),
        headline: p.title,
        description: p.description,
        datePublished: `${p.date}T08:00:00Z`,
        dateModified: `${p.updated || p.date}T08:00:00Z`,
        wordCount: p.words,
        timeRequired: `PT${p.minutes}M`,
        articleSection: CATEGORIES[p.category],
        keywords: p.tags.join(', '),
        inLanguage: 'en',
        image: url('/articles/og.jpg'),
        author: authorLd,
        publisher: authorLd,
        isPartOf: { '@id': `${SITE}/articles/#blog` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: SECTION.name, item: url('/articles/') },
          { '@type': 'ListItem', position: 2, name: p.title, item: url(path) },
        ],
      },
    ],
  };
  const dir = resolve(OUT, p.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    resolve(dir, 'index.html'),
    page({
      title: `${p.title} · ${SECTION.name}`,
      description: p.description,
      path,
      type: 'article',
      jsonld,
      body,
      published: p.date,
      modified: p.updated,
      tags: p.tags,
    }),
  );
}

/* ---------- Feed, sitemap, robots, 404 ---------- */
function feed(posts) {
  const items = posts.slice(0, 20).map((p) => {
    const { html } = renderBody(p.body);
    return `  <item>
    <title>${esc(p.title)}</title>
    <link>${url(`/articles/${p.slug}/`)}</link>
    <guid isPermaLink="true">${url(`/articles/${p.slug}/`)}</guid>
    <pubDate>${new Date(`${p.date}T08:00:00Z`).toUTCString()}</pubDate>
    <category>${CATEGORIES[p.category]}</category>
    <description>${esc(p.description)}</description>
    <content:encoded><![CDATA[${html.replace(/]]>/g, ']]]]><![CDATA[>')}]]></content:encoded>
  </item>`;
  });
  writeFileSync(
    resolve(OUT, 'feed.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
<channel>
  <title>${SECTION.name} by Reem Basho</title>
  <link>${url('/articles/')}</link>
  <atom:link href="${url('/articles/feed.xml')}" rel="self" type="application/rss+xml"/>
  <description>${esc(SECTION.description)}</description>
  <language>en</language>
  ${posts[0] ? `<lastBuildDate>${new Date(`${posts[0].date}T08:00:00Z`).toUTCString()}</lastBuildDate>` : ''}
${items.join('\n')}
</channel>
</rss>
`,
  );
}

function sitemap(posts, pages) {
  const today = new Date().toISOString().slice(0, 10);
  const rows = [
    { loc: url('/'), lastmod: today },
    { loc: url('/articles/'), lastmod: posts[0]?.date || today },
    ...Array.from({ length: pages - 1 }, (_, i) => ({ loc: url(`/articles/page/${i + 2}/`), lastmod: posts[0]?.date || today })),
    ...posts.map((p) => ({ loc: url(`/articles/${p.slug}/`), lastmod: p.updated || p.date })),
  ];
  writeFileSync(
    resolve(DIST, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${rows.map((r) => `  <url><loc>${r.loc}</loc><lastmod>${r.lastmod}</lastmod></url>`).join('\n')}
</urlset>
`,
  );
  writeFileSync(resolve(DIST, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${url('/sitemap.xml')}\n`);
}

function notFound() {
  const body = `<section class="wrap intro">
  <h1>Not on this sheet.</h1>
  <p class="lede">That page doesn't exist, or it moved. <a href="/articles/">See all articles</a>.</p>
</section>`;
  const html = page({
    title: 'Page not found',
    description: 'This page does not exist.',
    path: '/404.html',
    jsonld: { '@context': 'https://schema.org', '@type': 'WebPage', name: 'Page not found' },
    body,
    head: '<meta name="robots" content="noindex">',
  }).replace('<meta name="robots" content="index, follow, max-image-preview:large">\n', '');
  writeFileSync(resolve(DIST, '404.html'), html);
}

/* ---------- Run ---------- */
const posts = readPosts();
rmSync(OUT, { recursive: true, force: true });
mkdirSync(resolve(OUT, 'fonts'), { recursive: true });
const NM = resolve(ROOT, 'node_modules');
copyFileSync(resolve(NM, '@fontsource-variable/archivo/files/archivo-latin-standard-normal.woff2'), resolve(OUT, 'fonts/archivo.woff2'));
copyFileSync(resolve(NM, '@fontsource-variable/martian-mono/files/martian-mono-latin-wght-normal.woff2'), resolve(OUT, 'fonts/martian-mono.woff2'));
copyFileSync(resolve(ROOT, 'articles/style.css'), resolve(OUT, 'style.css'));
copyFileSync(resolve(ROOT, 'articles/icon.svg'), resolve(OUT, 'icon.svg'));
copyFileSync(resolve(ROOT, 'articles/og.jpg'), resolve(OUT, 'og.jpg'));

const pages = indexPages(posts);
for (const p of posts) articlePage(p, posts);
feed(posts);
sitemap(posts, pages);
notFound();
console.log(`articles: ${posts.length} posts, ${pages} index page(s), feed, sitemap, robots, 404 → ${SITE}`);
