import { useEffect, useRef, useState } from 'react';

/* ------------------------------------------------------------------
   The opening: two collaborators lay out the contact sheet.
   "Reem · build" (chinagraph blue) and "Reem · research" (chinagraph
   yellow) assemble the real hero DOM: the name stretches into a
   selection box, the headline is typed, the lens cards are dropped and
   alt-duplicated, the film is pulled in, and frame 01 gets circled.
   Everything animates the live page with WAAPI; cancelling the
   animations returns it to its normal CSS, so a skip is instant.
   ------------------------------------------------------------------ */

const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
const EASE_IO = 'cubic-bezier(0.65, 0, 0.35, 1)';
const SEEN = 'rb-intro-seen';
const CIRCLE =
  'M58 30 C120 6 236 8 276 52 C304 86 286 156 214 178 C150 197 64 192 30 160 C2 132 10 70 54 42 C92 18 168 12 214 20';

type Way = { t: number; x: number; y: number; ease?: string };

export function shouldRunIntro() {
  return typeof document !== 'undefined' && document.documentElement.classList.contains('intro');
}

export function replayIntro() {
  try {
    sessionStorage.removeItem(SEEN);
  } catch {
    /* ignore */
  }
  window.scrollTo(0, 0);
  window.location.hash = '';
  window.location.reload();
}

export function Intro({ onDone }: { onDone: () => void }) {
  const [done, setDone] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const curB = useRef<HTMLDivElement>(null);
  const curR = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const caret = useRef<HTMLDivElement>(null);
  const circle = useRef<SVGSVGElement>(null);
  const sample = useRef<SVGPathElement>(null);
  const hint = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    const anims: Animation[] = [];
    const timers: number[] = [];
    let finished = false;
    let cancelled = false;
    let debug = false;
    const later = (fn: () => void, ms: number) => {
      if (!debug) timers.push(window.setTimeout(fn, ms));
    };

    const finish = () => {
      if (finished) return;
      finished = true;
      timers.forEach(clearTimeout);
      html.classList.remove('intro', 'intro-hold');
      anims.forEach((a) => a.cancel());
      try {
        sessionStorage.setItem(SEEN, '1');
      } catch {
        /* ignore */
      }
      removeSkip();
      setDone(true);
      onDone();
    };

    const skip = (e: Event) => {
      if (e.type === 'keydown' && (e as KeyboardEvent).key === 'Tab') return;
      finish();
    };
    const skipEvents = ['pointerdown', 'wheel', 'keydown', 'touchmove'] as const;
    const addSkip = () => skipEvents.forEach((ev) => window.addEventListener(ev, skip, { passive: true }));
    const removeSkip = () => skipEvents.forEach((ev) => window.removeEventListener(ev, skip));

    const run = (el: Element | null, kf: Keyframe[], o: { delay?: number; duration: number; easing?: string }) => {
      if (!el) return;
      anims.push(el.animate(kf, { fill: 'both', easing: EASE, ...o }));
    };

    /** Move a cursor through timed waypoints (ms, viewport px). */
    const travel = (el: HTMLElement, way: Way[], vw: number) => {
      const end = way[way.length - 1].t;
      const kf: Keyframe[] = way.map((w) => ({
        offset: w.t / end,
        transform: `translate(${w.x}px, ${w.y}px)`,
        easing: w.ease ?? EASE_IO,
      }));
      anims.push(el.animate(kf, { duration: end, fill: 'both' }));
      // The name tag swings to the left of the arrow near the right edge.
      const tag = el.querySelector<HTMLElement>('.ic-tag');
      if (!tag) return;
      const w = tag.offsetWidth;
      const side = way.map((p) => (p.x + w + 30 > vw ? `translateX(${-(w + 22)}px)` : 'translateX(0)'));
      if (side.every((s) => s === side[0]) && side[0] === 'translateX(0)') return;
      anims.push(
        tag.animate(
          way.map((p, i) => ({ offset: p.t / end, transform: side[i], easing: p.ease ?? EASE_IO })),
          { duration: end, fill: 'both' },
        ),
      );
    };

    const press = (el: HTMLElement, at: number) =>
      run(el.querySelector('.ic-arrow'), [{ scale: 1 }, { scale: 0.78 }, { scale: 1 }], {
        delay: at,
        duration: 260,
        easing: 'ease-out',
      });

    const start = async () => {
      // Lay-out measurements need the real fonts.
      await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1400))]);
      if (cancelled) return;
      if (window.scrollY > 40) {
        finish();
        return;
      }

      const q = <T extends Element = HTMLElement>(s: string) => document.querySelector<T & Element>(s);
      const name = q('.hero-name');
      const letters = [...document.querySelectorAll<HTMLElement>('.hero-name .ch')];
      const chars = [...document.querySelectorAll<HTMLElement>('.hero-headline .ch')];
      const [c1, c2] = [...document.querySelectorAll<HTMLElement>('.lens-option')];
      const label = q('.chooser-label');
      const strip = q('.hero-strip');
      const ring = q('.frame[aria-current="true"] .circle-mark');
      const B = curB.current;
      const R = curR.current;
      if (!name || !c1 || !c2 || !label || !strip || !ring || !B || !R || !chars.length) {
        finish();
        return;
      }
      root.current?.classList.add('on');
      // ?intro-debug freezes the timeline for inspection: window.__introSeek(ms)
      if (new URLSearchParams(location.search).has('intro-debug')) {
        debug = true;
        (window as unknown as { __introSeek: (t: number) => void }).__introSeek = (t) =>
          anims.forEach((a) => {
            a.pause();
            a.currentTime = t;
          });
      } else addSkip();

      const vw = document.documentElement.clientWidth;
      const vh = window.innerHeight;
      const nr = name.getBoundingClientRect();
      const r1 = c1.getBoundingClientRect();
      const r2 = c2.getBoundingClientRect();
      const lr = label.getBoundingClientRect();
      const sr = strip.getBoundingClientRect();
      const cr = ring.getBoundingClientRect();
      const charRects = chars.map((c) => c.getBoundingClientRect());

      /* ---------- Build cursor: select box, name, headline, circle ---------- */
      const pad = 10;
      const bx = nr.left - pad;
      const by = nr.top - pad;
      const bw = nr.width + pad * 2;
      const bh = nr.height + pad * 2;
      const bxEl = box.current!;
      Object.assign(bxEl.style, { left: `${bx}px`, top: `${by}px`, width: `${bw}px`, height: `${bh}px` });
      bxEl.querySelector('.ib-size')!.textContent = `${Math.round(nr.width)} × ${Math.round(nr.height)}`;
      run(bxEl, [{ clipPath: 'inset(-40px 100% 100% -40px)', opacity: 1 }, { clipPath: 'inset(-40px -120px -40px -40px)', opacity: 1 }], {
        delay: 450,
        duration: 520,
        easing: EASE_IO,
      });
      run(bxEl, [{ opacity: 1 }, { opacity: 0 }], { delay: 1500, duration: 320, easing: 'ease-out' });
      run(bxEl.querySelector('.ib-handles'), [{ opacity: 0 }, { opacity: 1 }], { delay: 960, duration: 120 });

      letters.forEach((l, i) =>
        run(
          l,
          [
            { opacity: 0, transform: 'translateY(0.32em)', fontVariationSettings: "'wdth' 62" },
            { opacity: 1, transform: 'none', fontVariationSettings: "'wdth' 125" },
          ],
          { delay: 760 + i * 48, duration: 720 },
        ),
      );

      // Headline: typed, with a caret that jumps along the characters.
      const T0 = 1380;
      const STEP = 21;
      const times = chars.map((_, i) => {
        // a short breath after the comma
        const comma = chars.slice(0, i).some((c) => c.textContent === ',') ? 120 : 0;
        return T0 + i * STEP + comma;
      });
      chars.forEach((c, i) => run(c, [{ opacity: 0 }, { opacity: 1 }], { delay: times[i], duration: 1, easing: 'linear' }));
      const typeEnd = times[times.length - 1] + STEP;
      const cEl = caret.current!;
      const ch0 = charRects[0];
      cEl.style.height = `${ch0.height}px`;
      const caretKf: Keyframe[] = [{ offset: 0, transform: `translate(${ch0.left}px, ${ch0.top}px)`, opacity: 0, easing: 'steps(1, end)' }];
      const caretEnd = typeEnd + 520;
      caretKf.push({ offset: (T0 - 80) / caretEnd, transform: `translate(${ch0.left}px, ${ch0.top}px)`, opacity: 1, easing: 'steps(1, end)' });
      charRects.forEach((r, i) =>
        caretKf.push({ offset: times[i] / caretEnd, transform: `translate(${r.right}px, ${r.top}px)`, opacity: 1, easing: 'steps(1, end)' }),
      );
      caretKf.push({ offset: (typeEnd + 380) / caretEnd, transform: `translate(${charRects[charRects.length - 1].right}px, ${charRects[charRects.length - 1].top}px)`, opacity: 1 });
      caretKf.push({ offset: 1, transform: `translate(${charRects[charRects.length - 1].right}px, ${charRects[charRects.length - 1].top}px)`, opacity: 0 });
      anims.push(cEl.animate(caretKf, { duration: caretEnd, fill: 'both' }));

      run(q('.hero-role'), [{ opacity: 0, transform: 'translateY(10px)', filter: 'blur(6px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }], { delay: typeEnd + 40, duration: 700 });
      run(q('.hero-pitch'), [{ opacity: 0, transform: 'translateY(10px)', filter: 'blur(6px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }], { delay: typeEnd + 140, duration: 700 });

      /* ---------- Research cursor: drop a card, alt-drag its twin ---------- */
      const grab1 = { x: r1.left + r1.width * 0.62, y: r1.top + r1.height * 0.34 };
      const dx = Math.min(vw - r1.left + 40, (vw - r1.left) * 0.6 + 120);
      const dy = -70;
      run(
        c1,
        [
          { offset: 0, opacity: 1, transform: `translate(${dx}px, ${dy}px) rotate(8deg) scale(1.05)` },
          { offset: 0.86, opacity: 1, transform: 'translate(0, 0) rotate(0deg) scale(1.05)' },
          { offset: 1, opacity: 1, transform: 'none' },
        ],
        { delay: 120, duration: 760 },
      );
      const ddx = r1.left - r2.left;
      const ddy = r1.top - r2.top;
      const solid = 'var(--ground-2)';
      const glass = 'color-mix(in oklab, var(--ground-2) 70%, transparent)';
      run(
        c2,
        [
          { offset: 0, opacity: 0, backgroundColor: solid, transform: `translate(${ddx}px, ${ddy}px) scale(1.05)` },
          { offset: 0.06, opacity: 1, backgroundColor: solid, transform: `translate(${ddx}px, ${ddy}px) scale(1.05)` },
          { offset: 0.86, opacity: 1, backgroundColor: solid, transform: 'translate(0, 0) scale(1.05)' },
          { offset: 1, opacity: 1, backgroundColor: glass, transform: 'none' },
        ],
        { delay: 1000, duration: 640, easing: EASE_IO },
      );
      const altTag = R.querySelector('.ic-alt');
      run(altTag, [{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'none' }], { delay: 940, duration: 160 });
      run(altTag, [{ opacity: 1 }, { opacity: 0 }], { delay: 1680, duration: 160 });

      /* ---------- Research cursor: the film peeks in, gets pulled home ---------- */
      const peek = Math.round(vw * 0.62);
      const sy = Math.min(sr.top + sr.height * 0.42, vh - 36);
      const S0 = 1600;
      const SD = 1700;
      const landed = S0 + SD;
      run(
        strip,
        [
          { offset: 0, opacity: 1, transform: `translateX(${vw + 40}px)`, easing: EASE },
          { offset: 0.3, opacity: 1, transform: `translateX(${peek}px)`, easing: 'linear' },
          { offset: 0.4, opacity: 1, transform: `translateX(${peek}px)`, easing: 'cubic-bezier(0.55, 0, 0.15, 1)' },
          { offset: 1, opacity: 1, transform: 'translateX(0)' },
        ],
        { delay: S0, duration: SD, easing: 'linear' },
      );
      later(() => html.classList.remove('intro-hold'), landed - 120);

      /* ---------- Build cursor: write the margin note, circle frame 01 ---------- */
      const L0 = typeEnd + 140;
      const LD = 700;
      run(
        label,
        [{ opacity: 1, clipPath: 'inset(-24px 100% -40px -12px)' }, { opacity: 1, clipPath: 'inset(-24px -40px -40px -12px)' }],
        { delay: L0 + 260, duration: LD, easing: 'cubic-bezier(0.4, 0, 0.6, 1)' },
      );
      run(q('.chooser-hint'), [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { delay: L0 + LD, duration: 600 });

      const svg = circle.current!;
      Object.assign(svg.style, { left: `${cr.left}px`, top: `${cr.top}px`, width: `${cr.width}px`, height: `${cr.height}px` });
      const sp = sample.current!;
      const L = sp.getTotalLength();
      // On short screens frame 01 sits below the fold: skip the circle beat.
      const ringVisible = cr.bottom < vh - 8;
      const C0 = ringVisible ? Math.max(L0 + LD + 700, landed + 120) : Math.max(L0 + LD + 200, landed - 300);
      const CD = ringVisible ? 680 : 0;
      const N = 28;
      const easeIO = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
      const pts = Array.from({ length: N + 1 }, (_, i) => {
        const f = easeIO(i / N);
        const p = sp.getPointAtLength(L * f);
        return { f, x: cr.left + (p.x / 300) * cr.width, y: cr.top + (p.y / 200) * cr.height };
      });
      if (ringVisible) {
        run(
          svg.querySelector('.ic-draw'),
          pts.map((p, i) => ({ offset: i / N, strokeDashoffset: 1 - p.f })),
          { delay: C0, duration: CD, easing: 'linear' },
        );
        run(svg, [{ opacity: 0 }, { opacity: 1 }], { delay: C0, duration: 1, easing: 'linear' });
      }
      // At the end each collaborator points at their own lens: your turn.
      const point = (r: DOMRect) => ({ x: r.left + r.width * 0.5, y: r.top + r.height * 0.62 });
      const pB = point(r1);
      const pR = point(r2);
      if (vw < 700) pR.y += 34; // keep the two tags from stacking on phones
      const park = C0 + CD + 520;
      const out = park + 620;

      const lastChar = charRects[charRects.length - 1];
      const bWay: Way[] = [
        { t: 0, x: -60, y: vh * 0.72 },
        { t: 450, x: bx, y: by, ease: EASE_IO },
        { t: 980, x: Math.min(bx + bw, vw - 14), y: by + bh, ease: EASE },
        { t: T0 - 60, x: ch0.left + 4, y: ch0.bottom + 6 },
      ];
      for (let i = 6; i < charRects.length; i += 6) {
        bWay.push({ t: times[i], x: charRects[i].left + 4, y: charRects[i].bottom + 6, ease: 'linear' });
      }
      bWay.push({ t: typeEnd + 40, x: lastChar.right + 6, y: lastChar.bottom + 6, ease: 'linear' });
      bWay.push({ t: L0 + 260, x: lr.left + 2, y: lr.bottom - 4 });
      bWay.push({ t: L0 + 260 + LD, x: lr.right + 8, y: lr.bottom, ease: 'cubic-bezier(0.4, 0, 0.6, 1)' });
      if (ringVisible) {
        bWay.push({ t: C0 - 60, x: pts[0].x, y: pts[0].y });
        bWay.push({ t: C0, x: pts[0].x, y: pts[0].y });
        pts.forEach((p, i) => i > 0 && bWay.push({ t: C0 + (i / N) * CD, x: p.x, y: p.y, ease: 'linear' }));
        bWay.push({ t: C0 + CD + 80, x: pts[N].x, y: pts[N].y });
      }
      bWay.push({ t: park, x: pB.x, y: pB.y });
      bWay.push({ t: out + 320, x: pB.x, y: pB.y });
      travel(B, bWay, vw);
      press(B, 450);
      if (ringVisible) press(B, C0 - 40);

      const rWay: Way[] = [
        { t: 0, x: vw + 60, y: grab1.y + dy },
        { t: 120, x: grab1.x + dx, y: grab1.y + dy },
        { t: 120 + 650, x: grab1.x, y: grab1.y, ease: EASE },
        { t: 1000, x: grab1.x, y: grab1.y },
        { t: 1000 + 550, x: grab1.x - ddx, y: grab1.y - ddy, ease: EASE_IO },
        { t: 1640, x: grab1.x - ddx, y: grab1.y - ddy },
        { t: S0 + SD * 0.32, x: peek + 34, y: sy },
        { t: S0 + SD * 0.4, x: peek + 34, y: sy },
        { t: landed, x: sr.left + 34, y: sy, ease: 'cubic-bezier(0.55, 0, 0.15, 1)' },
        { t: landed + 60, x: sr.left + 34, y: sy },
        { t: Math.min(landed + 700, park), x: pR.x, y: pR.y },
        { t: out + 320, x: pR.x, y: pR.y },
      ];
      travel(R, rWay, vw);
      press(R, 120);
      press(R, 1000);
      press(R, S0 + SD * 0.34);

      /* ---------- Header arrives, cursors hand over ---------- */
      run(q('.header'), [{ opacity: 0, transform: 'translateY(-100%)' }, { opacity: 1, transform: 'none' }], {
        delay: landed + 200,
        duration: 700,
      });
      [B, R].forEach((c) => run(c.querySelector('.ic-body'), [{ opacity: 1, scale: 1 }, { opacity: 0, scale: 0.5 }], { delay: out, duration: 320, easing: 'ease-in' }));
      run(hint.current, [{ opacity: 0 }, { opacity: 1 }], { delay: 500, duration: 400 });
      run(hint.current, [{ opacity: 1 }, { opacity: 0 }], { delay: out - 300, duration: 300 });
      later(finish, out + 340);
    };

    start();
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      anims.forEach((a) => a.cancel());
      removeSkip();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (done) return null;
  return (
    <div ref={root} className="intro-layer" aria-hidden="true">
      <div ref={box} className="intro-box">
        <span className="ib-handles">
          <i />
          <i />
          <i />
          <i />
        </span>
        <span className="ib-size mono" />
      </div>
      <div ref={caret} className="intro-caret" />
      <svg ref={circle} className="intro-circle" viewBox="0 0 300 200" preserveAspectRatio="none">
        <path ref={sample} d={CIRCLE} fill="none" stroke="none" />
        <path
          className="ic-draw"
          d={CIRCLE}
          pathLength={1}
          fill="none"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeDasharray="1 1"
          strokeDashoffset="1"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <Cursor ref={curB} kind="build" />
      <Cursor ref={curR} kind="research" />
      <button ref={hint} className="intro-skip mono" tabIndex={-1}>
        Click anywhere to skip
      </button>
    </div>
  );
}

function Cursor({ ref, kind }: { ref: React.Ref<HTMLDivElement>; kind: 'build' | 'research' }) {
  return (
    <div ref={ref} className={`intro-cursor ${kind}`}>
      <div className="ic-body">
        <svg className="ic-arrow" viewBox="0 0 22 24" width="22" height="24">
          <path d="M2.2 1.6 L19.4 11.2 C20.3 11.7 20.1 13 19.1 13.2 L12.4 14.6 L9.1 21.1 C8.6 22 7.3 21.9 7 20.9 Z" />
        </svg>
        <span className="ic-tag">
          Reem · {kind}
          {kind === 'research' && <span className="ic-alt">alt-drag</span>}
        </span>
      </div>
    </div>
  );
}
