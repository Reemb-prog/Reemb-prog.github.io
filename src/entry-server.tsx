import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { LazyMotion, domMax } from 'motion/react';
import App from './App';

/** Renders the page to static HTML at build time (scripts/prerender.mjs), so
    crawlers and link previews get the full content without running JS. */
export function render() {
  return renderToString(
    <StrictMode>
      <LazyMotion features={domMax} strict>
        <App />
      </LazyMotion>
    </StrictMode>,
  );
}
