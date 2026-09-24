import { defineConfig, searchForWorkspaceRoot } from 'vite-plus';

export default defineConfig({
  appType: 'mpa',
  server: {
    port: 5199,
    // The panes import the skins' sources straight from `skins/*`, outside this app's root.
    fs: { allow: [searchForWorkspaceRoot(process.cwd())] },
  },
  resolve: {
    // One copy of React and of the Video.js packages, whichever package the import comes from.
    dedupe: ['react', 'react-dom', '@videojs/react', '@videojs/html'],
  },
  build: {
    rollupOptions: {
      input: {
        index: 'index.html',
        original: 'original.html',
        html: 'html.html',
        react: 'react.html',
      },
    },
  },
});
