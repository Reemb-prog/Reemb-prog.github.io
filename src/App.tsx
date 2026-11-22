import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { order, projects, type Lens } from './data/content';
import { FilmStrip } from './components/FilmStrip';
import { Detail } from './components/Detail';
import { About, Close, Footer, Header, Hero, Learning, Now, Questions, Toolkit } from './components/Sections';
import { initialLens, persistLens } from './lib';

const byId = Object.fromEntries(projects.map((p) => [p.id, p]));

export default function App() {
  const first = useMemo(initialLens, []);
  const [lens, setLensState] = useState<Lens>(first ?? 'build');
  const [chosen, setChosen] = useState(first !== null);
  const [selected, setSelected] = useState<string>(order[first ?? 'build'][0]);
  const [flick, setFlick] = useState<null | Lens>(null);
  const flickTimer = useRef<number>(0);

  const items = useMemo(() => order[lens].map((id) => byId[id]), [lens]);

  useEffect(() => {
    document.documentElement.dataset.lens = lens;
  }, [lens]);

  const setLens = useCallback(
    (next: Lens, keepSelection?: string) => {
      setChosen(true);
      persistLens(next);
      if (next === lens) return;
      setFlick(next);
      window.clearTimeout(flickTimer.current);
      flickTimer.current = window.setTimeout(() => setFlick(null), 700);
      // Swap the world at the darkest moment of the flicker.
      window.setTimeout(() => {
        setLensState(next);
        setSelected((cur) => keepSelection ?? (order[next].includes(cur) ? cur : order[next][0]));
      }, 90);
    },
    [lens],
  );

  const select = useCallback((id: string, scroll?: boolean) => {
    setSelected(id);
    if (scroll) document.getElementById('work')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const inLens = useCallback((id: string): Lens | 'both' | 'now' => {
    if (id === 'now') return 'now';
    const b = order.build.includes(id);
    const r = order.research.includes(id);
    return b && r ? 'both' : b ? 'build' : 'research';
  }, []);

  const ask = useCallback(
    (target: string) => {
      if (target === 'now') {
        document.getElementById('now')?.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      if (!order[lens].includes(target)) setLens(lens === 'build' ? 'research' : 'build', target);
      else setSelected(target);
      window.setTimeout(() => document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' }), 120);
    },
    [lens, setLens],
  );

  // Keys 1–9 pick a frame; arrows step through frames when not typing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.metaKey || e.ctrlKey || e.altKey || t.closest('input, textarea, [contenteditable]')) return;
      const n = Number(e.key);
      if (n >= 1 && n <= 9 && items[n - 1]) {
        setSelected(items[n - 1].id);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [items]);

  return (
    <>
      <a className="skip" href="#work">
        Skip to projects
      </a>
      <div className={`flicker${flick ? ' on' : ''}${flick === 'research' ? ' to-research' : ''}`} aria-hidden="true" />
      <Header lens={lens} onLens={setLens} />
      <main>
        <Hero
          lens={lens}
          chosen={chosen}
          onLens={setLens}
          strip={<FilmStrip lens={lens} items={items} selectedId={selected} onSelect={select} />}
        />
        <Detail lens={lens} items={items} selectedId={selected} onSelect={setSelected} />
        <About lens={lens} />
        <Now lens={lens} />
        <Questions lens={lens} inLens={inLens} onAsk={ask} />
        <Learning lens={lens} />
        <Toolkit lens={lens} />
        <Close lens={lens} />
      </main>
      <Footer />
    </>
  );
}
