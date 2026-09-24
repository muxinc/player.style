/*
 * End-to-end proof of the hosted registry: scaffold a fresh Vite + React + TypeScript project and a fresh Vite
 * vanilla-TS project, serve `site/public/r` on localhost, run the stock shadcn CLI against it (the namespaced form in
 * the React project, the full-URL form in the HTML one), wire the installed files into each app around the demo
 * video, build with Vite, and screenshot the result with a proxy-aware Chromium (`e2e/browser.mjs`).
 *
 *   pnpm -F build-registry e2e                     # after pnpm build:skins && pnpm build:registry
 *   REGISTRY_E2E_DIR=/tmp/registry-e2e REGISTRY_E2E_ITEM=sutro pnpm -F build-registry e2e
 *
 * Writes the projects, `<project>.png` screenshots and `summary.json` under `REGISTRY_E2E_DIR` (default: a
 * `player-style-registry-e2e` directory in the OS temp directory) and exits non-zero on the first failing step.
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { CATALOG_FILES, INSTALL_DIRECTORY, PRESETS, REGISTRY_NAMESPACE } from '../index.ts';
import { launchBrowser } from './browser.mjs';

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoDir = resolve(packageDir, '../..');
const registryDir = join(repoDir, 'site/public/r');
const require = createRequire(import.meta.url);
const shadcnBin = join(dirname(require.resolve('shadcn/schema')), '../index.js');

const e2eDir = resolve(process.env.REGISTRY_E2E_DIR ?? join(tmpdir(), 'player-style-registry-e2e'));
const item = process.env.REGISTRY_E2E_ITEM ?? 'yt';

const DEMO_VIDEO = 'https://stream.mux.com/fXNzVtmtWuyz00xnSrJg4OJH6PyNo6D02UzmgeKGkP5YQ/highest.mp4';
const DEMO_POSTER = 'https://image.mux.com/fXNzVtmtWuyz00xnSrJg4OJH6PyNo6D02UzmgeKGkP5YQ/thumbnail.webp?time=52';
const MEDIA_PLACEHOLDER = '<!-- Add a compatible media element here. -->';
const CREATE_VITE = 'create-vite@8.2.0';
/**
 * Playwright's Chromium ships without H.264, so the demo MP4 cannot decode there. The apps keep the real URL; for the
 * screenshot the browser is handed a short WebM sample in its place.
 */
const PLAYABLE_MEDIA = join(packageDir, 'e2e/media/sample.webm');

/** The two consumers: React adds through the namespace, HTML through the item's URL, so both forms are exercised. */
const projects = [
  { name: 'vite-react', framework: 'react', template: 'react-ts', css: 'src/index.css', add: 'namespace', port: 5411 },
  { name: 'vite-html', framework: 'html', template: 'vanilla-ts', css: 'src/style.css', add: 'url', port: 5412 },
];

const summary = { item, e2eDir, projects: [] };

if (!existsSync(join(registryDir, 'react', `${item}.json`))) {
  await run(process.execPath, ['build.ts'], packageDir);
}

await rm(e2eDir, { recursive: true, force: true });
await mkdir(e2eDir, { recursive: true });

const registry = await serveRegistry();

try {
  for (const project of projects) {
    const result = await runProject(project, registry.url);

    summary.projects.push(result);
    console.log(`[${project.name}] ok: ${result.screenshot}`);
  }
} finally {
  registry.close();
  await writeFile(join(e2eDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
}

console.log(`\nRegistry e2e passed for ${item}. Details: ${join(e2eDir, 'summary.json')}`);

async function runProject(project, registryUrl) {
  const dir = join(e2eDir, project.name);
  const log = (message) => console.log(`[${project.name}] ${message}`);
  const commands = [];
  const exec = async (command, args, cwd = dir) => {
    commands.push([command, ...args].join(' '));
    return run(command, args, cwd);
  };

  log('scaffolding');
  await exec('pnpm', ['dlx', CREATE_VITE, project.name, '--template', project.template, '--no-interactive'], e2eDir);
  await configureProject(project, dir, registryUrl);
  await exec('pnpm', ['install'], dir);

  log('shadcn add');
  const itemUrl = `${registryUrl}/r/${project.framework}/${item}.json`;
  const target = project.add === 'namespace' ? `${REGISTRY_NAMESPACE}/${item}` : itemUrl;

  await exec(process.execPath, [shadcnBin, 'view', target, '--cwd', dir], dir);
  await exec(process.execPath, [shadcnBin, 'add', target, '--yes', '--overwrite', '--cwd', dir], dir);

  const installDir = join(dir, 'src/components', INSTALL_DIRECTORY, item);
  const installed = CATALOG_FILES[project.framework].map((file) => join(installDir, file));

  for (const file of installed) {
    if (!existsSync(file)) throw new Error(`${project.name}: shadcn add did not write ${file}.`);
  }

  const manifest = JSON.parse(await readFile(join(dir, 'package.json'), 'utf8'));
  const hosted = JSON.parse(await readFile(join(registryDir, project.framework, `${item}.json`), 'utf8'));
  const [dependency] = hosted.dependencies;
  const [packageName, version] = splitDependency(dependency);

  if (manifest.dependencies?.[packageName] !== version) {
    throw new Error(
      `${project.name}: expected ${dependency} in package.json, found ${manifest.dependencies?.[packageName]}.`
    );
  }

  const notes = [];

  for (const [index, file] of installed.entries()) {
    const written = await readFile(file, 'utf8');
    const expected = hosted.files[index].content;
    if (written === expected) continue;

    // shadcn 4.21 writes `'use client'` through with `rsc: false`; older versions stripped it, which is harmless.
    if (written.trimStart() === expected.replace(/^'use client';\n\n/, '').trimStart()) {
      notes.push(`shadcn stripped the 'use client' directive from ${file} (components.json has rsc: false).`);
      continue;
    }

    throw new Error(`${project.name}: shadcn rewrote ${file}; diff it against the hosted item to see how.`);
  }

  log('wiring the app');
  await writeApp(project, dir, hosted);

  log('building');
  await exec('pnpm', ['run', 'build'], dir);

  if (project.framework === 'html') await exec('pnpm', ['exec', 'tsc', '--noEmit', '-p', 'tsconfig.json'], dir);

  log('screenshotting');
  const screenshot = await screenshotPreview(project, dir, notes);

  return {
    name: project.name,
    dir,
    add: target,
    dependency,
    installed,
    commands,
    ...screenshot,
  };
}

async function configureProject(project, dir, registryUrl) {
  const rootManifest = JSON.parse(await readFile(join(repoDir, 'package.json'), 'utf8'));
  const manifestPath = join(dir, 'package.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));

  // The CLI detects the package manager from `packageManager` and the lockfile, so pin it before it runs.
  await writeFile(
    manifestPath,
    `${JSON.stringify({ ...manifest, private: true, packageManager: rootManifest.packageManager }, null, 2)}\n`
  );
  await writeFile(
    join(dir, 'pnpm-workspace.yaml'),
    ['packages:', "  - '.'", 'allowBuilds:', '  esbuild: true', '  unrs-resolver: true', ''].join('\n')
  );

  // A flat tsconfig with the `@/*` alias: the CLI resolves `aliases.components` through tsconfig `paths`, and the
  // stock Vite scaffolds have no alias. No `baseUrl`: TypeScript 6 deprecates it (TS5101 fails `tsc`), and `paths`
  // alone resolves relative to the tsconfig for both TypeScript and the CLI.
  await writeFile(
    join(dir, 'tsconfig.json'),
    `${JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2022',
          useDefineForClassFields: true,
          module: 'ESNext',
          lib: ['ES2022', 'DOM', 'DOM.Iterable'],
          types: ['vite/client'],
          skipLibCheck: true,
          moduleResolution: 'bundler',
          allowImportingTsExtensions: true,
          verbatimModuleSyntax: true,
          moduleDetection: 'force',
          noEmit: true,
          jsx: 'react-jsx',
          strict: true,
          noUnusedLocals: true,
          noUnusedParameters: true,
          noFallthroughCasesInSwitch: true,
          paths: { '@/*': ['./src/*'] },
        },
        include: ['src'],
      },
      null,
      2
    )}\n`
  );

  const plugins = project.framework === 'react' ? "import react from '@vitejs/plugin-react';\n" : '';

  await writeFile(
    join(dir, 'vite.config.ts'),
    [
      "import { fileURLToPath, URL } from 'node:url';",
      '',
      "import { defineConfig } from 'vite';",
      plugins,
      'export default defineConfig({',
      project.framework === 'react' ? '  plugins: [react()],' : '',
      "  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },",
      '});',
      '',
    ]
      .filter((line) => line !== '')
      .join('\n')
  );

  // The minimal components.json for a project that never ran `shadcn init`: aliases, a stylesheet path, no Tailwind.
  // `cssVariables` must stay true: with false the CLI runs its colour-mapping pass over every JSX string literal,
  // splitting on spaces and deduplicating tokens (`viewBox="0 0 24 24"` becomes `"0 24"`).
  await writeFile(
    join(dir, 'components.json'),
    `${JSON.stringify(
      {
        $schema: 'https://ui.shadcn.com/schema.json',
        style: 'new-york',
        rsc: false,
        tsx: true,
        tailwind: { config: '', css: project.css, baseColor: 'neutral', cssVariables: true, prefix: '' },
        aliases: {
          components: '@/components',
          ui: '@/components/ui',
          lib: '@/lib',
          utils: '@/lib/utils',
          hooks: '@/hooks',
        },
        registries: { [REGISTRY_NAMESPACE]: `${registryUrl}/r/${project.framework}/{name}.json` },
      },
      null,
      2
    )}\n`
  );
}

async function writeApp(project, dir, hosted) {
  const preset = PRESETS[hosted.meta.preset];
  const skinDir = `./components/${INSTALL_DIRECTORY}/${item}`;
  const page = 'body { margin: 0; background: #1c1c1c; } #root, #app { max-width: 960px; margin: 40px auto; }\n';

  await writeFile(join(dir, project.css), page);

  if (project.framework === 'react') {
    const { component } = hosted.meta;

    await rm(join(dir, 'src/App.css'), { force: true });
    await writeFile(
      join(dir, 'src/App.tsx'),
      [
        `import { ${preset.reactMedia}, ${preset.reactPlayer} } from '@videojs/react/${preset.entry}';`,
        '',
        `import { ${component} } from '${skinDir}/Skin';`,
        `import '${skinDir}/skin.css';`,
        '',
        'export default function App() {',
        '  return (',
        `    <${preset.reactPlayer}>`,
        `      <${component}>`,
        `        <${preset.reactMedia} src="${DEMO_VIDEO}" poster="${DEMO_POSTER}" playsInline />`,
        `      </${component}>`,
        `    </${preset.reactPlayer}>`,
        '  );',
        '}',
        '',
      ].join('\n')
    );
    return;
  }

  const media = `<${preset.media} src="${DEMO_VIDEO}" poster="${DEMO_POSTER}" playsinline></${preset.media}>`;

  await rm(join(dir, 'src/counter.ts'), { force: true });
  await writeFile(
    join(dir, 'src/main.ts'),
    [
      `import '@videojs/html/${preset.entry}/player';`,
      `import '${skinDir}/register';`,
      `import '${skinDir}/skin.css';`,
      `import skin from '${skinDir}/skin.html?raw';`,
      '',
      "import './style.css';",
      '',
      "const root = document.querySelector<HTMLDivElement>('#app');",
      "if (!root) throw new Error('No #app.');",
      '',
      `root.innerHTML = \`<${preset.player}>\${skin.replace('${MEDIA_PLACEHOLDER}', '${media}')}</${preset.player}>\`;`,
      '',
    ].join('\n')
  );
}

async function screenshotPreview(project, dir, notes) {
  const preview = spawn(
    'pnpm',
    ['exec', 'vite', 'preview', '--host', '127.0.0.1', '--port', String(project.port), '--strictPort'],
    { cwd: dir, stdio: 'ignore' }
  );
  const url = `http://127.0.0.1:${project.port}/`;
  const screenshot = join(e2eDir, `${project.name}.png`);
  const consoleErrors = [];
  const failedRequests = [];

  try {
    await waitForUrl(url);

    const browser = await launchBrowser();

    try {
      const page = await browser.newPage({ viewport: { width: 1040, height: 640 } });

      page.on('console', (message) => {
        if (message.type() === 'error') consoleErrors.push(message.text());
      });
      page.on('requestfailed', (request) => failedRequests.push(`${request.url()} ${request.failure()?.errorText}`));

      await page.route(DEMO_VIDEO, (route) => route.fulfill({ path: PLAYABLE_MEDIA, contentType: 'video/webm' }));
      notes.push(`The screenshot plays ${PLAYABLE_MEDIA} in place of the demo MP4 (no H.264 in the test browser).`);

      await page.goto(url, { waitUntil: 'networkidle' });
      await page.waitForSelector('video, audio', { state: 'attached' });
      await page
        .waitForFunction(
          () => {
            const media = document.querySelector('video, audio');
            return media instanceof HTMLMediaElement && media.readyState >= 1;
          },
          undefined,
          { timeout: 30_000 }
        )
        .catch(() => notes.push('Media metadata did not load within 30s; the screenshot shows the poster.'));
      await page.hover('.media-skin');
      await page.waitForTimeout(500);
      await page.screenshot({ path: screenshot });

      const skinBox = await page.locator('.media-skin').first().boundingBox();
      if (!skinBox || skinBox.width < 100 || skinBox.height < 50) {
        throw new Error(`${project.name}: the skin root is not laid out (${JSON.stringify(skinBox)}).`);
      }
    } finally {
      await browser.close();
    }
  } finally {
    preview.kill();
  }

  if (consoleErrors.length) {
    throw new Error(
      `${project.name}: console errors\n${consoleErrors.join('\n')}\nfailed requests:\n${failedRequests.join('\n')}`
    );
  }

  return { url, screenshot, failedRequests, notes };
}

/** Serve `site/public/r` at `/r/*` on a free loopback port, the way the site does in production. */
function serveRegistry() {
  const server = createServer(async (request, response) => {
    const pathname = new URL(request.url ?? '/', 'http://127.0.0.1').pathname;
    const path = resolve(registryDir, `.${pathname.replace(/^\/r/, '')}`);
    const source = path.startsWith(`${registryDir}/`) ? await readFile(path).catch(() => undefined) : undefined;

    if (!source) {
      response.statusCode = 404;
      response.end('Not found.');
      return;
    }

    response.setHeader('content-type', 'application/json; charset=utf-8');
    response.end(source);
  });

  return new Promise((resolvePromise, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();

      resolvePromise({ url: `http://127.0.0.1:${port}`, close: () => server.close() });
    });
  });
}

function splitDependency(dependency) {
  const separator = dependency.lastIndexOf('@');

  return [dependency.slice(0, separator), dependency.slice(separator + 1)];
}

function run(command, args, cwd) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, { cwd, stdio: ['ignore', 'pipe', 'pipe'], env: process.env });
    const output = [];

    child.stdout.on('data', (chunk) => output.push(chunk));
    child.stderr.on('data', (chunk) => output.push(chunk));
    child.once('error', reject);
    child.once('exit', (code) => {
      if (code === 0) return resolvePromise(Buffer.concat(output).toString());

      process.stderr.write(Buffer.concat(output));
      reject(new Error(`${[command, ...args].join(' ')} exited with code ${code} in ${cwd}.`));
    });
  });
}

async function waitForUrl(url, timeout = 30_000) {
  const deadline = Date.now() + timeout;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Not listening yet.
    }

    await new Promise((resolvePromise) => setTimeout(resolvePromise, 250));
  }

  throw new Error(`${url} did not come up within ${timeout}ms.`);
}
