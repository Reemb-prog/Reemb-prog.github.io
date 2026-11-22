import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' keeps asset paths relative, so the build works on GitHub Pages
// at https://<user>.github.io/<repo>/ and on a custom domain alike.
export default defineConfig({
  base: './',
  plugins: [react()],
});
