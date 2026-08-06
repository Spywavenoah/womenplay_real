import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true'
        ? null
        : {
            // Runtime DB writes (and other non-source artifacts) must not trigger a full page reload.
            ignored: [
              '**/database.json',
              '**/tests/.test-database.json',
              '**/tests/.smoke-database.json',
              '**/dist/**',
              '**/node_modules/**',
              '**/.git/**',
            ],
          },
    },
  };
});
