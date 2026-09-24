import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { registryItemSchema, registrySchema } from 'shadcn/schema';

import { CATALOG_FILES, createCatalog, FRAMEWORKS, type OpenEdition, type OpenEditionFileName } from './index.ts';

const packageDir = import.meta.dirname;
const repoDir = resolve(packageDir, '../..');
const require = createRequire(import.meta.url);
const shadcnBin = join(dirname(require.resolve('shadcn/schema')), '../index.js');

export interface BuildRegistryOptions {
  /** The `skins/*` parent; every child with a `dist/open` is one item. */
  skinsDir?: string;
  /** Where the hosted files go: `r/<framework>/<name>.json`, `registry.json` and `catalog.json` per catalog. */
  outDir?: string;
  /** Where the per-catalog `registry.json` and source files are staged for `shadcn build`. */
  stagingDir?: string;
  log?: (message: string) => void;
}

export interface BuildRegistryResult {
  outDir: string;
  /** Item names, the same in every catalog. */
  items: string[];
  /** `skins/*` directories without a `dist/open`, left out of this build. */
  skipped: string[];
}

/** The open edition files every catalog needs, the union of `CATALOG_FILES`. */
const OPEN_EDITION_FILES = [...new Set(Object.values(CATALOG_FILES).flat())] as OpenEditionFileName[];

interface PackageManifest {
  name?: string;
  version?: string;
  description?: string;
  homepage?: string;
  author?: string | { name?: string };
  peerDependencies?: Record<string, string>;
}

/**
 * Read every `skins/<name>/dist/open` into an `OpenEdition`, in directory order. A skin whose open edition is not
 * built is reported in `skipped` rather than failing the build, since `pnpm build:skins` runs first and fails on its
 * own when a skin does not build.
 */
export async function readOpenEditions(skinsDir: string): Promise<{ editions: OpenEdition[]; skipped: string[] }> {
  const names = (await readdir(skinsDir, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  const editions: OpenEdition[] = [];
  const skipped: string[] = [];

  for (const name of names) {
    const openDir = join(skinsDir, name, 'dist/open');

    if (!OPEN_EDITION_FILES.every((file) => existsSync(join(openDir, file)))) {
      skipped.push(name);
      continue;
    }

    const manifest = JSON.parse(await readFile(join(skinsDir, name, 'package.json'), 'utf8')) as PackageManifest;
    if (!manifest.name || !manifest.version || !manifest.description) {
      throw new Error(`skins/${name}/package.json needs a name, version and description.`);
    }

    const entries = await Promise.all(
      OPEN_EDITION_FILES.map(async (file) => [file, await readFile(join(openDir, file), 'utf8')] as const)
    );

    editions.push({
      name,
      package: manifest.name,
      version: manifest.version,
      description: manifest.description,
      homepage: manifest.homepage,
      author: typeof manifest.author === 'string' ? manifest.author : manifest.author?.name,
      peerDependencies: manifest.peerDependencies ?? {},
      files: Object.fromEntries(entries) as Record<OpenEditionFileName, string>,
    });
  }

  return { editions, skipped };
}

/**
 * Build the hosted registry: stage each catalog's `registry.json` and source files, run `shadcn build` on it (the
 * same CLI a project installs with, so the item JSON is what it expects), copy the `catalog.json` index next to the
 * output, and validate every hosted file against the shadcn schemas.
 */
export async function buildRegistry({
  skinsDir = join(repoDir, 'skins'),
  outDir = join(repoDir, 'site/public/r'),
  stagingDir = join(packageDir, 'dist'),
  log = console.log,
}: BuildRegistryOptions = {}): Promise<BuildRegistryResult> {
  const { editions, skipped } = await readOpenEditions(skinsDir);
  if (editions.length === 0) throw new Error(`No built open editions under ${skinsDir}; run pnpm build:skins first.`);

  await rm(outDir, { recursive: true, force: true });
  await rm(stagingDir, { recursive: true, force: true });

  for (const framework of FRAMEWORKS) {
    const catalogDir = join(stagingDir, framework);
    const hostedDir = join(outDir, framework);
    const { registry, catalog } = createCatalog(editions, framework);

    for (const item of registry.items) {
      for (const file of item.files ?? []) {
        const path = join(catalogDir, file.path);

        await mkdir(dirname(path), { recursive: true });
        await writeFile(path, file.content ?? '');
      }
    }

    await writeFile(join(catalogDir, 'registry.json'), `${JSON.stringify(registry, null, 2)}\n`);
    await runShadcn(['build', 'registry.json', '--cwd', catalogDir, '--output', hostedDir]);
    await writeFile(join(hostedDir, 'catalog.json'), `${JSON.stringify(catalog, null, 2)}\n`);
  }

  const hosted = await validateHostedRegistry(outDir);

  log(
    `Built ${hosted.length} registry files for ${editions.length} skins into ${relative(process.cwd(), outDir) || '.'}` +
      (skipped.length ? ` (skipped, no dist/open: ${skipped.join(', ')})` : '')
  );

  return { outDir, items: editions.map((edition) => edition.name), skipped };
}

/**
 * Every hosted catalog holds `registry.json`, `catalog.json` and one `<name>.json` per item, each valid against the
 * shadcn schema. Returns the validated file paths.
 */
export async function validateHostedRegistry(outDir: string): Promise<string[]> {
  const files: string[] = [];

  for (const framework of FRAMEWORKS) {
    const hostedDir = join(outDir, framework);
    const registry = registrySchema.parse(JSON.parse(await readFile(join(hostedDir, 'registry.json'), 'utf8')));
    const present = (await readdir(hostedDir)).filter((name) => name.endsWith('.json')).sort();
    const expected = ['catalog.json', 'registry.json', ...registry.items.map((item) => `${item.name}.json`)].sort();

    if (present.join('\n') !== expected.join('\n')) {
      throw new Error(`Hosted ${framework} catalog holds ${present.join(', ')}; expected ${expected.join(', ')}.`);
    }

    for (const item of registry.items) {
      const path = join(hostedDir, `${item.name}.json`);
      const hosted = registryItemSchema.parse(JSON.parse(await readFile(path, 'utf8')));

      for (const file of hosted.files ?? []) {
        if (!file.content) throw new Error(`${framework}/${item.name}.json: ${file.path} has no content.`);
        if (!file.target) throw new Error(`${framework}/${item.name}.json: ${file.path} has no target.`);
      }

      files.push(path);
    }

    files.push(join(hostedDir, 'registry.json'), join(hostedDir, 'catalog.json'));
  }

  return files;
}

/** Run the shadcn CLI from this package's devDependency, surfacing its output only when it fails. */
function runShadcn(args: readonly string[]): Promise<void> {
  return new Promise<void>((resolvePromise, reject) => {
    const child = spawn(process.execPath, [shadcnBin, ...args], { cwd: packageDir, stdio: ['ignore', 'pipe', 'pipe'] });
    const output: Buffer[] = [];

    child.stdout.on('data', (chunk: Buffer) => output.push(chunk));
    child.stderr.on('data', (chunk: Buffer) => output.push(chunk));
    child.once('error', reject);
    child.once('exit', (code, signal) => {
      if (code === 0) return resolvePromise();

      process.stderr.write(Buffer.concat(output));
      reject(new Error(`shadcn ${args[0]} exited with ${signal ? `signal ${signal}` : `code ${code}`}.`));
    });
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const outDir = process.argv[2] ? resolve(process.argv[2]) : undefined;

  await buildRegistry({ outDir });
}
