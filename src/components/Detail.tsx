import { AnimatePresence, m as motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { Lens, Project } from '../data/content';
import { Glyph } from './Glyph';
import { img } from '../lib';
import { CountUp } from '../reveal';

type Props = {
  lens: Lens;
  items: Project[];
  selectedId: string;
  onSelect: (id: string) => void;
};

export function Detail({ lens, items, selectedId, onSelect }: Props) {
  const reduce = useReducedMotion();
  const i = Math.max(0, items.findIndex((p) => p.id === selectedId));
  const p = items[i];
  if (!p) return null;
  const go = (d: number) => onSelect(items[(i + d + items.length) % items.length].id);

  const enter = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, filter: 'blur(6px)', y: 10 },
        animate: { opacity: 1, filter: 'blur(0px)', y: 0 },
        exit: { opacity: 0, filter: 'blur(4px)', y: -6 },
      };

  return (
    <section id="work" className="section" aria-labelledby="work-title">
      <div className="wrap">
        <h2 id="work-title" className="section-title" data-reveal="develop">
          {lens === 'build' ? 'On the light table' : 'Under the safelight'}
        </h2>
        <div className="detail">
          <div className="detail-photo">
            <AnimatePresence mode="wait" initial={false}>
              <motion.figure
                key={p.id}
                className="print"
                style={{ margin: 0 }}
                initial={reduce ? { opacity: 0 } : { opacity: 0, rotate: -4, y: 24 }}
                animate={{ opacity: 1, rotate: -1.2, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, rotate: 2, y: -12 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="print-img">
                  {p.img ? (
                    <img src={img(p.img)} alt={p.imgAlt ?? ''} loading="lazy" decoding="async" />
                  ) : (
                    <Glyph kind={p.glyph ?? ''} />
                  )}
                </div>
                <figcaption className="print-caption hand">
                  {String(i + 1).padStart(2, '0')} · {p.title}
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>

          <div aria-live="polite">
            <div className="detail-counter">
              <span className="mono">
                Frame {String(i + 1).padStart(2, '0')} of {String(items.length).padStart(2, '0')}
              </span>
              <div className="arrows">
                <button className="icon-btn" onClick={() => go(-1)} aria-label="Previous project">
                  <ArrowLeft />
                </button>
                <button className="icon-btn" onClick={() => go(1)} aria-label="Next project">
                  <ArrowRight />
                </button>
              </div>
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.article key={p.id} {...enter} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
                <h3 className="detail-title" style={{ margin: 0, fontSize: undefined }}>
                  {p.title}
                </h3>
                <p className="detail-kind">
                  {p.kind} · {p.date}
                </p>
                <p className="detail-question hand">“{p.question}”</p>

                <h3>What I did</h3>
                <ul className="did">
                  {p.did.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>

                {p.numbers && (
                  <>
                    <h3>In numbers</h3>
                    <dl className="numbers">
                      {p.numbers.map((n) => (
                        <div key={n.label}>
                          <dt>
                            <CountUp value={n.value} />
                          </dt>
                          <dd>{n.label}</dd>
                        </div>
                      ))}
                    </dl>
                  </>
                )}

                {p.honest && (
                  <div className="honest">
                    <span className="hand">Honest note</span>
                    <p>{p.honest}</p>
                  </div>
                )}

                <h3>Built with</h3>
                <ul className="stack">
                  {p.stack.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </motion.article>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
