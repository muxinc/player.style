import { defineConfig } from 'vite-plus';

export default defineConfig({
  build: {
    // One entry holds the players, the three skins and hls.js (through the Mux media).
    chunkSizeWarningLimit: 1536,
  },
});
