import { useEffect, useRef } from 'react';

/* A grease-pencil ring that trails the pointer. It names what a drag or a
   click will do ("drag" on the film), hides where the loupe takes over, and
   swells over controls. Fine pointers only; the native cursor stays. */
export function CursorRing() {
  const el = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!fine.matches || calm.matches) return;
    const ring = el.current!;
    let x = -100;
    let y = -100;
    let tx = x;
    let ty = y;
    let raf = 0;
    let state = '';

    const tick = () => {
      x += (tx - x) * 0.2;
      y += (ty - y) * 0.2;
      ring.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (Math.abs(tx - x) + Math.abs(ty - y) > 0.3) raf = requestAnimationFrame(tick);
      else raf = 0;
    };

    const setState = (s: string, text = '') => {
      if (s === state) return;
      state = s;
      ring.dataset.state = s;
      if (label.current) label.current.textContent = text;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      tx = e.clientX;
      ty = e.clientY;
      if (!ring.classList.contains('on')) {
        x = tx;
        y = ty;
        ring.classList.add('on');
      }
      const t = e.target as Element;
      const tag = t.closest?.('[data-cursor], a, button, summary');
      const kind = tag?.getAttribute('data-cursor');
      if (kind === 'hide') setState('hide');
      else if (kind === 'drag') setState('label', 'drag');
      else if (tag) setState('link');
      else setState('');
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onLeave = () => ring.classList.remove('on');
    const onDown = () => ring.classList.add('down');
    const onUp = () => ring.classList.remove('down');

    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
    };
  }, []);

  return (
    <div ref={el} className="cursor-ring" aria-hidden="true">
      <span ref={label} className="cr-label" />
    </div>
  );
}
