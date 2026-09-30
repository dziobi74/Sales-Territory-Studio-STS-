import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

function safeTailwind(): Plugin[] {
  const plugins = tailwindcss() as Plugin[];
  return plugins.map(p => {
    if (p.name === '@tailwindcss/vite:generate:serve' && p.hotUpdate) {
      const origHotUpdate = p.hotUpdate;
      return {
        ...p,
        hotUpdate(this: any, ctx: any) {
          // When HMR is disabled, prevent @tailwindcss/vite from calling undefined this.environment.hot.send
          if (!this?.environment?.hot || process.env.DISABLE_HMR === 'true') {
            return [];
          }
          try {
            return typeof origHotUpdate === 'function' ? origHotUpdate.call(this, ctx) : [];
          } catch {
            return [];
          }
        },
      };
    }
    return p;
  });
}

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      safeTailwind(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
