import { defineConfig } from 'vite-plus';

export default defineConfig({
  build: {
    // hls.js, which the Mux media load, is one ~540 kB chunk on its own.
    chunkSizeWarningLimit: 1024,
    rollupOptions: {
      onLog(level, log, handler) {
        // The skins' and Video.js's React entries start with `'use client'`, which means nothing in a client-only app.
        if (log.code === 'MODULE_LEVEL_DIRECTIVE') return;

        handler(level, log);
      },
    },
  },
});
