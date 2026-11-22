import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/archivo/standard.css';
import '@fontsource-variable/martian-mono/standard.css';
import '@fontsource/gochi-hand/400.css';
import './index.css';
import { LazyMotion } from 'motion/react';

const features = () => import('./motion-features').then((r) => r.default);
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LazyMotion features={features} strict>
      <App />
    </LazyMotion>
  </StrictMode>,
);
