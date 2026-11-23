// Inject the server-rendered page into dist/index.html.
// Runs after `vite build` and `vite build --ssr src/entry-server.tsx --outDir dist-ssr`.
import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const htmlPath = resolve(root, 'dist/index.html');
const { render } = await import(pathToFileURL(resolve(root, 'dist-ssr/entry-server.js')).href);

const html = readFileSync(htmlPath, 'utf8');
if (!html.includes('<!--app-html-->')) throw new Error('dist/index.html has no <!--app-html--> marker');
const app = render();
writeFileSync(htmlPath, html.replace('<!--app-html-->', app));
rmSync(resolve(root, 'dist-ssr'), { recursive: true, force: true });
console.log(`prerendered index.html (${Math.round(app.length / 1024)} KB of markup)`);
