import { useEffect, useRef, useState } from 'react';

/** Marks every [data-reveal] element with .is-in once it scrolls into view.
    CSS keeps content visible unless JS ran and motion is allowed. */
export function useReveal(dep: unknown) {
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]:not(.is-in)');
    if (!('IntersectionObserver' in window)) {
      els.forEach((e) => e.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        }),
      { rootMargin: '0px 0px -10% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [dep]);
}

/** A figure like "228" or "~104" that counts up when it comes into view. */
export function CountUp({ value }: { value: string }) {
  const m = /^(\D*)(\d+)(.*)$/.exec(value);
  const target = m ? Number(m[2]) : 0;
  const animate =
    !!m && target > 1 && typeof window !== 'undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [n, setN] = useState(animate ? 0 : target);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!animate || !ref.current) return;
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const D = 1100;
      const step = (t: number) => {
        const k = Math.min(1, (t - t0) / D);
        setN(Math.round(target * (1 - Math.pow(2, -10 * k))));
        if (k < 1) raf = requestAnimationFrame(step);
        else setN(target);
      };
      raf = requestAnimationFrame(step);
    });
    io.observe(ref.current);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [animate, target]);

  if (!m) return <>{value}</>;
  return (
    <>
      <span className="sr-only">{value}</span>
      <span ref={ref} aria-hidden="true">
        {m[1]}
        {n}
        {m[3]}
      </span>
    </>
  );
}
