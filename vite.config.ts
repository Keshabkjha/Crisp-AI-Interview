import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Vite does not expose process.env by default, so we need to define it.
    // This is crucial for accessing process.env.API_KEY.
    'process.env': process.env,
  },
});
