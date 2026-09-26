import { defineConfig } from 'vite-plus';

export default defineConfig({
  test: {
    // Bundling the pages and launching the browsers happen once, in `beforeAll`.
    hookTimeout: 180_000,
    testTimeout: 90_000,
    // Cases run concurrently, each in its own browser context, and the engines side by side.
    sequence: { concurrent: true },
    maxConcurrency: 8,
  },
});
