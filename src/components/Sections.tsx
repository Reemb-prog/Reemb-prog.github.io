import { useEffect, useState } from 'react';
import { m as motion } from 'motion/react';
import { Code2, Download, FlaskConical, Mail, Copy } from 'lucide-react';
import { Github, Linkedin } from './BrandIcons';
import { about, learning, now, profile, questions, recognition, skills, type Lens } from '../data/content';
import { credits } from '../data/credits';
import { ArrowMark, CircleMark, UnderlineMark } from './Marks';
import { asset, img } from '../lib';

/* ---------------- Header ---------------- */
export function Header({ lens, onLens }: { lens: Lens; onLens: (l: Lens) => void }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  return (
    <header className={`header${scrolled ? ' scrolled' : ''}`}>
      <div className="wrap header-inner">
        <a className="brand" href="#top">
          Reem Basho
        </a>
        <nav className="nav" aria-label="Sections">
          <a href="#work">Work</a>
          <a href="#about">About</a>
          <a href="#now">Now</a>
          <a href="#questions">Questions</a>
          <a href="#learning">Learning</a>
          <a href="#contact">Contact</a>
        </nav>
        <div className="header-actions">
          <div className="mini-lens" role="group" aria-label="Lens">
            <motion.span
              className="thumb"
              aria-hidden="true"
              initial={false}
              animate={{ x: lens === 'build' ? 0 : '100%' }}
              style={{ width: 'calc(50% - 3px)' }}
              transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            />
            <button aria-pressed={lens === 'build'} onClick={() => onLens('build')}>
              Build
            </button>
            <button aria-pressed={lens === 'research'} onClick={() => onLens('research')}>
              Research
            </button>
          </div>
          <a className="btn small" href={asset(profile.cv[lens])} download aria-label="Download CV (PDF)">
            <Download aria-hidden="true" />
            <span className="header-cv-label">CV</span>
          </a>
        </div>
      </div>
    </header>
  );
}

/* ---------------- Hero ---------------- */
export function Hero({
  lens,
  chosen,
  onLens,
  strip,
}: {
  lens: Lens;
  chosen: boolean;
  onLens: (l: Lens) => void;
  strip: React.ReactNode;
}) {
  const opts: { id: Lens; name: string; who: string; Icon: typeof Code2 }[] = [
    { id: 'build', name: 'Build', who: 'I’m hiring a developer or a team lead', Icon: Code2 },
    { id: 'research', name: 'Research', who: 'I’m looking for a curious researcher', Icon: FlaskConical },
  ];
  return (
    <section id="top" className="hero">
      <div className="wrap hero-top">
        <div>
          <h1 className="hero-name">
            <span>Reem</span>
            <span>Basho</span>
          </h1>
          <p className="hero-headline">{profile.headline}</p>
          <p className="hero-role">
            {profile.role[lens]} · CS senior at Rafic Hariri University
          </p>
          <p className="hero-pitch">{profile.pitch[lens]}</p>
        </div>
        <div className="chooser">
          <p className="chooser-label hand">
            Who’s looking?
            <ArrowMark />
          </p>
          <div className="chooser-options" role="group" aria-label="Choose a lens">
            {opts.map(({ id, name, who, Icon }) => {
              const on = chosen && lens === id;
              return (
                <button key={id} className="lens-option" aria-pressed={on} onClick={() => onLens(id)}>
                  <Icon className="lo-icon" aria-hidden="true" />
                  <span className="lo-name">{name}</span>
                  <span className="lo-who">{who}</span>
                  {on && <CircleMark key={id} />}
                </button>
              );
            })}
          </div>
          <p className="chooser-hint">
            {chosen
              ? 'Switch any time. Same person, the other lens reorders everything.'
              : 'Pick one. The whole page re-prints for you, and you can switch any time.'}
          </p>
        </div>
      </div>
      <div className="hero-strip">{strip}</div>
    </section>
  );
}

/* ---------------- About ---------------- */
export function About({ lens }: { lens: Lens }) {
  return (
    <section id="about" className="section" aria-labelledby="about-title">
      <div className="wrap about">
        <div className="about-side">
          <h2 id="about-title" className="section-title">
            Hi, I’m Reem.
          </h2>
          <figure className="print" style={{ margin: 0 }}>
            <div className="print-img">
              <img
                className="photo"
                src={img(lens === 'build' ? 'saida-day' : 'saida-night')}
                alt="The Sea Castle of Saida, Lebanon, standing in the harbour"
                loading="lazy"
                decoding="async"
              />
            </div>
            <figcaption className="print-caption hand">Saida, Lebanon</figcaption>
          </figure>
        </div>
        <div className="about-copy">
          {about.map((p) => (
            <p key={p}>{p}</p>
          ))}
          <ul className="facts">
            {profile.facts.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Now ---------------- */
export function Now({ lens }: { lens: Lens }) {
  return (
    <section id="now" className="section" aria-labelledby="now-title">
      <div className="wrap">
        <h2 id="now-title" className="section-title">
          What I’m doing now
        </h2>
        <div className="now">
          <div className="now-side">
            <figure className="print" style={{ margin: 0 }}>
              <div className="print-img">
                <img
                  className="photo"
                  src={img('panelcare')}
                  alt="A technician cleaning solar panels on a roof"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <figcaption className="print-caption hand">PanelCare · sprint 1</figcaption>
            </figure>
            <p className="now-meta">
              <strong>{now.title}</strong>
              {now.product} · {now.date}
            </p>
            <ul className="stack" style={{ marginTop: 16 }}>
              {now.stack.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="now-line">{now.line[lens]}</p>
            <p className="now-context">{now.context}</p>
            <ol className="steps">
              {now.steps.map((s) => (
                <li key={s.title}>
                  <div>
                    <h3>{s.title}</h3>
                    <p>{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Questions ---------------- */
export function Questions({
  lens,
  inLens,
  onAsk,
}: {
  lens: Lens;
  inLens: (id: string) => Lens | 'both' | 'now';
  onAsk: (target: string) => void;
}) {
  const [hover, setHover] = useState<number | null>(null);
  return (
    <section id="questions" className="questions" aria-labelledby="q-title">
      <div className="questions-bg" aria-hidden="true">
        <img src={img('stars')} alt="" loading="lazy" decoding="async" />
      </div>
      <div className="wrap">
        <h2 id="q-title" className="section-title">
          Questions I keep asking
        </h2>
        <p className="questions-intro">
          Most of my projects started as one of these. Tap a question to see what I built to chase it.
        </p>
        <ul className="q-list">
          {questions.map((q, i) => {
            const where = inLens(q.target);
            const label =
              where === 'now'
                ? 'see what I’m doing now'
                : where === 'both' || where === lens
                  ? 'open the frame'
                  : `opens in the ${where} lens`;
            return (
              <li key={q.q}>
                <button
                  className="q-btn"
                  onClick={() => onAsk(q.target)}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover(null)}
                >
                  <span>{q.q}</span>
                  <span className="q-to">→ {label}</span>
                  {hover === i && <UnderlineMark color="#ffd84a" />}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* ---------------- Learning ---------------- */
export function Learning({ lens }: { lens: Lens }) {
  return (
    <section id="learning" className="section" aria-labelledby="l-title">
      <div className="wrap">
        <h2 id="l-title" className="section-title">
          A thirst I don’t plan to cure
        </h2>
        <table className="log">
          <thead>
            <tr>
              <th scope="col">When</th>
              <th scope="col">What I studied</th>
              <th scope="col">What stuck</th>
            </tr>
          </thead>
          <tbody>
            {learning.map((c) => (
              <tr key={c.name} className={c.lenses.includes(lens) ? 'on' : 'off'}>
                <td className="mono">{c.when}</td>
                <td>
                  <span className="c-name">{c.name}</span>
                  {c.by && <span className="c-by">{c.by}</span>}
                </td>
                <td className="c-stuck">{c.stuck}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="log-note">
          Marked rows matter most for the {lens} lens. The rest still shaped how I think.
        </p>
      </div>
    </section>
  );
}

/* ---------------- Toolkit + recognition ---------------- */
export function Toolkit({ lens }: { lens: Lens }) {
  const sorted = [...skills].sort((a, b) => Number(b.lenses[0] === lens) - Number(a.lenses[0] === lens));
  return (
    <section id="toolkit" className="section" aria-labelledby="t-title">
      <div className="wrap">
        <h2 id="t-title" className="section-title">
          Tools I reach for
        </h2>
        <div className="kit">
          {sorted.map((g) => (
            <div key={g.group} className="kit-group">
              <h3>{g.group}</h3>
              <ul className="stack">
                {g.items.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <h3 className="sub-title">Along the way</h3>
        <ul className="recog">
          {recognition.map((r) => (
            <li key={r.what}>
              <span className="mono when">{r.when}</span>
              <strong>{r.what}</strong>
              <span className="note">{r.note}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------------- Close ---------------- */
export function Close({ lens }: { lens: Lens }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };
  return (
    <section id="contact" className="close" aria-labelledby="c-title">
      <div className="close-bg" aria-hidden="true">
        <img className="photo" src={img(lens === 'build' ? 'saida-day' : 'saida-night')} alt="" loading="lazy" decoding="async" />
      </div>
      <div className="wrap close-inner">
        <h2 id="c-title" className="close-title">
          Ask me something.
        </h2>
        <p className="close-hand hand">I like questions. Send me a hard one.</p>
        <div className="email-row">
          <a className="email" href={`mailto:${profile.email}`}>
            {profile.email}
          </a>
          <button className="btn ghost small" onClick={copy}>
            <Copy aria-hidden="true" /> Copy
          </button>
          <span className="copied" aria-live="polite">
            {copied ? 'copied!' : ''}
          </span>
        </div>
        <div className="close-links">
          <a className="btn" href={asset(profile.cv[lens])} download>
            <Download aria-hidden="true" /> Download CV (PDF)
          </a>
          <a className="btn ghost" href={`mailto:${profile.email}`}>
            <Mail aria-hidden="true" /> Email
          </a>
          <a className="btn ghost" href={profile.github} target="_blank" rel="noreferrer">
            <Github aria-hidden="true" /> GitHub
          </a>
          <a className="btn ghost" href={profile.linkedin} target="_blank" rel="noreferrer">
            <Linkedin aria-hidden="true" /> LinkedIn
          </a>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-inner">
        <p>© 2026 Reem Basho. Designed and built with React. No backend, no tracking.</p>
        <details>
          <summary>Photo credits</summary>
          <ul className="credits">
            {credits.map((c) => (
              <li key={c.file}>
                <a href={c.url} target="_blank" rel="noreferrer">
                  {c.title}
                </a>{' '}
                · {c.author} · {c.license}
              </li>
            ))}
          </ul>
        </details>
      </div>
    </footer>
  );
}
