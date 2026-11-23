import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, m as motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { Lens, Project } from '../data/content';
import { CircleMark } from './Marks';
import { Glyph } from './Glyph';
import { img } from '../lib';

type Props = {
  lens: Lens;
  items: Project[];
  selectedId: string;
  onSelect: (id: string, scroll?: boolean) => void;
};

export function FilmStrip({ lens, items, selectedId, onSelect }: Props) {
  const scroller = useRef<HTMLDivElement>(null);
  const drag = useRef({ down: false, x: 0, left: 0, moved: false });
  const [dragging, setDragging] = useState(false);
  const [edges, setEdges] = useState({ start: true, end: false });
  const reduce = useReducedMotion();

  const updateEdges = () => {
    const el = scroller.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8 });
  };

  useEffect(() => {
    updateEdges();
    const el = scroller.current;
    el?.scrollTo({ left: 0, behavior: reduce ? 'auto' : 'smooth' });
  }, [lens, reduce]);

  // Keep the selected frame in view when it changes from elsewhere.
  const prevSel = useRef(selectedId);
  useEffect(() => {
    if (prevSel.current === selectedId) return;
    prevSel.current = selectedId;
    const el = scroller.current?.querySelector<HTMLElement>(`[data-id="${selectedId}"]`);
    const box = scroller.current;
    if (!el || !box) return;
    const l = el.offsetLeft;
    if (l < box.scrollLeft || l + el.offsetWidth > box.scrollLeft + box.clientWidth) {
      box.scrollTo({ left: l - 24, behavior: reduce ? 'auto' : 'smooth' });
    }
  }, [selectedId, reduce]);

  const nudge = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: reduce ? 'auto' : 'smooth' });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    drag.current = { down: true, x: e.clientX, left: scroller.current!.scrollLeft, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d.down) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 6) {
      d.moved = true;
      setDragging(true);
    }
    if (d.moved) scroller.current!.scrollLeft = d.left - dx;
  };
  const endDrag = () => {
    drag.current.down = false;
    if (dragging) setTimeout(() => setDragging(false), 0);
  };

  return (
    <div className="film" role="region" aria-label="Project contact sheet">
      <div className="film-edge mono" aria-hidden="true">
        <span>Saida 33.56°N 35.37°E</span>
        <span className="ar">صيدا · لبنان</span>
        <span>{lens === 'build' ? 'Daylight · build lens' : 'Safelight · research lens'}</span>
        <span>{String(items.length).padStart(2, '0')} exposures</span>
      </div>
      <div
        ref={scroller}
        className={`film-scroller${dragging ? ' dragging' : ''}`}
        data-cursor="drag"
        onScroll={updateEdges}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {items.map((p, i) => (
            <Frame
              key={p.id}
              p={p}
              index={i}
              lens={lens}
              selected={p.id === selectedId}
              onClick={() => {
                if (drag.current.moved) return;
                onSelect(p.id, true);
              }}
            />
          ))}
        </AnimatePresence>
      </div>
      <div className="strip-controls">
        <span className="mono kbd-hint">Drag the film · keys 1–9 pick a frame</span>
        <div className="arrows">
          <button className="icon-btn" onClick={() => nudge(-1)} disabled={edges.start} aria-label="Scroll frames left">
            <ArrowLeft />
          </button>
          <button className="icon-btn" onClick={() => nudge(1)} disabled={edges.end} aria-label="Scroll frames right">
            <ArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
}

function Frame({
  p,
  index,
  lens,
  selected,
  onClick,
}: {
  p: Project;
  index: number;
  lens: Lens;
  selected: boolean;
  onClick: () => void;
}) {
  const [lp, setLp] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const reduce = useReducedMotion();
  const num = String(index + 1).padStart(2, '0');

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || !p.img) return;
    const r = e.currentTarget.getBoundingClientRect();
    setLp({ x: e.clientX - r.left, y: e.clientY - r.top, w: r.width, h: r.height });
  };

  const Z = 2.4;
  return (
    <motion.button
      layout={!reduce}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 260, damping: 30 }}
      className="frame"
      data-id={p.id}
      aria-current={selected}
      aria-label={`Frame ${num}: ${p.title}. Open on the loupe.`}
      onClick={onClick}
    >
      <div
        className="frame-img"
        data-cursor={p.img ? 'hide' : undefined}
        onPointerMove={onMove}
        onPointerLeave={() => setLp(null)}
      >
        {p.img ? (
          <img
            key={`${p.id}-${lens}`}
            className="photo develop"
            style={{ animationDelay: `${Math.min(index, 6) * 90}ms` }}
            src={img(p.img)}
            alt=""
            loading={index < 4 ? 'eager' : 'lazy'}
            decoding="async"
            draggable={false}
          />
        ) : (
          <Glyph kind={p.glyph ?? ''} />
        )}
        {lp && (
          <div
            className="loupe"
            style={{
              left: lp.x,
              top: lp.y,
              backgroundImage: `url(${img(p.img!)})`,
              backgroundSize: `${lp.w * Z}px ${lp.h * Z}px`,
              backgroundPosition: `${-(lp.x * Z - 75)}px ${-(lp.y * Z - 75)}px`,
            }}
          />
        )}
      </div>
      {selected && <CircleMark />}
      <div className="frame-meta">
        <span className="mono frame-num">{num}</span>
        <span className="frame-title">{p.title}</span>
      </div>
    </motion.button>
  );
}
