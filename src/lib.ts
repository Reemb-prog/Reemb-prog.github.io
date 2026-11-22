import type { Lens } from './data/content';

export const img = (name: string) => `${import.meta.env.BASE_URL}img/${name}.webp`;
export const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

const KEY = 'rb-lens';

/** Lens from ?lens=, then localStorage. null means the visitor has not chosen yet. */
export function initialLens(): Lens | null {
  try {
    const q = new URLSearchParams(window.location.search).get('lens');
    if (q === 'build' || q === 'research') return q;
    const s = window.localStorage.getItem(KEY);
    if (s === 'build' || s === 'research') return s;
  } catch {
    /* storage can be blocked; fall through */
  }
  return null;
}

export function persistLens(lens: Lens) {
  try {
    window.localStorage.setItem(KEY, lens);
    const url = new URL(window.location.href);
    url.searchParams.set('lens', lens);
    window.history.replaceState(null, '', url);
  } catch {
    /* ignore */
  }
}
