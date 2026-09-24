import { defineConfig } from 'vite-plus';

const ignoredPaths = [
  '**/node_modules/**',
  '**/dist/**',
  '**/.next/**',
  '**/.vite/**',
  '**/.content-collections/**',
  '**/.github/**',
  '**/*.md',
  '**/*.mdx',
  'CHANGELOG.md',
  // Archived: kept in place for reference and publishing, but no longer linted or formatted.
  'themes/**',
  'examples/**',
  'scripts/build-theme/**',
  'scripts/publish-packages/**',
  // Screenshots and per-skin build output.
  'docs/porting/screens/**',
];

export default defineConfig({
  fmt: {
    arrowParens: 'always',
    bracketSpacing: true,
    ignorePatterns: ignoredPaths,
    printWidth: 120,
    quoteProps: 'as-needed',
    jsxSingleQuote: false,
    semi: true,
    singleQuote: true,
    sortImports: true,
    sortPackageJson: true,
    sortTailwindcss: true,
    tabWidth: 2,
    trailingComma: 'es5',
    useTabs: false,
    overrides: [
      {
        files: ['**/*.css'],
        options: {
          singleQuote: false,
        },
      },
    ],
  },
  lint: {
    ignorePatterns: ignoredPaths,
    plugins: ['typescript', 'react'],
  },
});
