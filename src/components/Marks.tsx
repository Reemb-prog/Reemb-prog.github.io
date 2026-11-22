import { m as motion, useReducedMotion } from 'motion/react';

/* Hand-drawn chinagraph marks. Paths are authored to overshoot like a real
   grease-pencil loop, then drawn on with pathLength. */

const draw = (reduce: boolean | null, delay = 0) => ({
  initial: { pathLength: reduce ? 1 : 0, opacity: reduce ? 1 : 0 },
  animate: { pathLength: 1, opacity: 1 },
  transition: { pathLength: { duration: reduce ? 0 : 0.55, ease: [0.65, 0, 0.35, 1] as const, delay }, opacity: { duration: 0.01, delay } },
});

export function CircleMark({ className = 'circle-mark', delay = 0 }: { className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <svg className={className} viewBox="0 0 300 200" preserveAspectRatio="none" aria-hidden="true">
      <motion.path
        d="M58 30 C120 6 236 8 276 52 C304 86 286 156 214 178 C150 197 64 192 30 160 C2 132 10 70 54 42 C92 18 168 12 214 20"
        fill="none"
        stroke="var(--mark)"
        strokeWidth="3.2"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        {...draw(reduce, delay)}
      />
    </svg>
  );
}

export function UnderlineMark({ color = 'currentColor' }: { color?: string }) {
  const reduce = useReducedMotion();
  return (
    <svg className="underline-mark" viewBox="0 0 400 12" preserveAspectRatio="none" aria-hidden="true">
      <motion.path
        d="M2 8 C80 3 160 10 240 5 C300 2 360 8 398 4"
        fill="none"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        {...draw(reduce)}
      />
    </svg>
  );
}

export function ArrowMark() {
  const reduce = useReducedMotion();
  return (
    <svg viewBox="0 0 54 40" aria-hidden="true">
      <motion.path
        d="M3 6 C14 4 30 8 38 22 C41 27 42 31 42 35"
        fill="none"
        stroke="var(--mark)"
        strokeWidth="2.4"
        strokeLinecap="round"
        {...draw(reduce, 0.3)}
      />
      <motion.path
        d="M34 28 L42 36 L49 27"
        fill="none"
        stroke="var(--mark)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...draw(reduce, 0.75)}
      />
    </svg>
  );
}
