import { spawn } from 'node:child_process';
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  findPresets,
  type Framework,
  FRAMEWORKS,
  listSourceFiles,
  PRESETS,
  readSkinCatalog,
  readSkinManifest,
  skinPackages,
  workspaceVideojsVersion,
} from 'build-skin';
import { registryItemSchema, registrySchema } from 'shadcn/schema';

import { createCatalog, type SkinSource } from './index.ts';

const packageDir = import.meta.dirname;
const repoDir = resolve(packageDir, '../..');
const require = createRequire(import.meta.url);
const shadcnBin = join(dirname(require.resolve('shadcn/schema')), '../index.js');

export interface BuildRegistryOptions {
  /** The `skins/*` parent; every `skins/<name>/<framework>/` package adds one item per preset. */
  skinsDir?: string;
  /** Where the hosted files go: `r/<framework>/<item>.json`, `registry.json` and `catalog.json` per catalog. */
  outDir?: string;
  /** Where the per-catalog `registry.json` and source files are staged for `shadcn build`. */
  stagingDir?: string;
  log?: (message: string) => void;
}

export interface BuildRegistryResult {
  outDir: string;
  /** Item names per catalog. */
  items: Record<Framework, string[]>;
}

interface PackageManifest {
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

/**
 * Read every skin package's sources: `skin.json`, `package.json`, the skin's `catalog.json` and every file under
 * `src/`. Nothing is built first; the registry serves the source a `skin create` project holds. Fails when a skin
 * targets another Video.js release than the workspace catalog, since the site previews it on that release.
 */
export async function readSkinSources(skinsDir: string): Promise<SkinSource[]> {
  const packages = skinPackages(skinsDir).map((skin) => ({ ...skin, presets: findPresets(skin.dir) }));
  const videojs = workspaceVideojsVersion(resolve(skinsDir, '..'));

  return Promise.all(
    packages.map(async ({ name, framework, dir, presets }): Promise<SkinSource> => {
      const manifest = readSkinManifest(dir);
      if (manifest.videojs !== videojs) {
        throw new Error(
          `skins/${name}/${framework}/skin.json targets Video.js ${manifest.videojs}; the workspace is on ${videojs}.`
        );
      }

      const pkg = JSON.parse(await readFile(join(dir, 'package.json'), 'utf8')) as PackageManifest;
      const siblings = packages.filter((skin) => skin.name === name).flatMap((skin) => skin.presets);
      const paths = await listSourceFiles(join(dir, 'src'));

      return {
        name,
        framework,
        manifest,
        catalog: readSkinCatalog(name, skinsDir),
        defaultPreset: PRESETS.find((preset) => siblings.includes(preset))!,
        presets,
        dependencies: [
          ...new Set([...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.peerDependencies ?? {})]),
        ],
        files: Object.fromEntries(
          await Promise.all(paths.map(async (path) => [path, await readFile(join(dir, 'src', path), 'utf8')] as const))
        ),
      };
    })
  );
}

/**
 * Build the hosted registry: stage each catalog's `registry.json` and source files (imports rewritten for the install
 * directory), run `shadcn build` on it (the same CLI a project installs with, so the item JSON is what it expects),
 * copy the `catalog.json` index next to the output, and validate every hosted file against the shadcn schemas.
 */
export async function buildRegistry({
  skinsDir = join(repoDir, 'skins'),
  outDir = join(repoDir, 'site/public/r'),
  stagingDir = join(packageDir, 'dist'),
  log = console.log,
}: BuildRegistryOptions = {}): Promise<BuildRegistryResult> {
  const sources = await readSkinSources(skinsDir);
  if (sources.length === 0) throw new Error(`No skin packages under ${skinsDir}.`);

  await rm(outDir, { recursive: true, force: true });
  await rm(stagingDir, { recursive: true, force: true });

  const items = {} as BuildRegistryResult['items'];

  for (const framework of FRAMEWORKS) {
    const catalogDir = join(stagingDir, framework);
    const hostedDir = join(outDir, framework);
    const { registry, catalog } = createCatalog(sources, framework);
    // Every preset of a skin carries its shared files, so each staged file is written once.
    const staged = new Map(
      registry.items.flatMap((item) => (item.files ?? []).map((file) => [file.path, file.content ?? ''] as const))
    );

    items[framework] = registry.items.map((item) => item.name);
    await mkdir(catalogDir, { recursive: true });
    await Promise.all(
      [...staged].map(async ([file, content]) => {
        const path = join(catalogDir, file);

        await mkdir(dirname(path), { recursive: true });
        await writeFile(path, content);
      })
    );

    await writeFile(join(catalogDir, 'registry.json'), `${JSON.stringify(registry, null, 2)}\n`);
    await runShadcn(['build', 'registry.json', '--cwd', catalogDir, '--output', hostedDir]);
    await writeFile(join(hostedDir, 'catalog.json'), `${JSON.stringify(catalog, null, 2)}\n`);
  }

  const hosted = await validateHostedRegistry(outDir);

  log(
    `Built ${hosted.length} registry files for ${sources.length} skin packages into ${relative(process.cwd(), outDir) || '.'}`
  );

  return { outDir, items };
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
