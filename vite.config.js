import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite = the dev server + bundler. The React plugin lets Vite understand JSX.
export default defineConfig({
  plugins: [react()],
});
