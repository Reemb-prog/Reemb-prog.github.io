import { useEffect, useRef, useState } from 'react';
import { ArrowUp } from 'lucide-react';

/* A round "back to top" control. It appears once the hero is behind you,
   and its grease-pencil ring fills as you read down the page. */
export function ToTop() {
  const [show, setShow] = useState(false);
  const ring = useRef<SVGCircleElement>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const y = window.scrollY;
      setShow(y > window.innerHeight * 0.6);
      if (ring.current) ring.current.style.strokeDashoffset = String(1 - (max > 0 ? Math.min(1, y / max) : 0));
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', on);
      window.removeEventListener('resize', on);
    };
  }, []);

  const up = () => {
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: calm ? 'auto' : 'smooth' });
    document.querySelector<HTMLElement>('.brand')?.focus({ preventScroll: true });
  };

  return (
    <button
      className={`to-top${show ? ' on' : ''}`}
      onClick={up}
      aria-label="Back to top"
      tabIndex={show ? 0 : -1}
      aria-hidden={!show}
    >
      <svg className="tt-ring" viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="24" r="22" pathLength={1} className="tt-track" />
        <circle ref={ring} cx="24" cy="24" r="22" pathLength={1} className="tt-fill" />
      </svg>
      <ArrowUp aria-hidden="true" />
    </button>
  );
}
