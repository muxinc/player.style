/*
 * Intake: take a `npx @videojs/cli skin create` project into the repository as `skins/<slug>/<framework>/`.
 *
 *   node scripts/add-skin/add-skin.ts <project> [--name <slug>] [--owner <github-user>]
 *
 * The first run for a framework copies the project's `src/`, `skin.json` and `package.json`, and leaves the workbench
 * (`apps/`), its deploy files, the nested workspace and the agent files behind. It writes the shared `vite.config.ts`
 * and `tsconfig.json`, makes `package.json` a private workspace package, renames the base theme to the skin's name so
 * two skins on one page do not style each other, and creates `catalog.json` and a CODEOWNERS line.
 *
 * Running it again with the same `--name` and another preset (a live-video project, say) merges that preset in: it
 * copies `src/<preset>/`, adds shared files the skin lacks, and lists shared files that differ instead of overwriting
 * them. Every step is idempotent.
 */
import { existsSync } from 'node:fs';
import { cp, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import { parseArgs } from 'node:util';

import { FRAMEWORKS, PRESETS, type SkinManifest, SKINS_DIR, workspaceVideojsVersion } from 'build-skin';

const repoDir = resolve(SKINS_DIR, '..');

/** Shared `src/` folders a preset merge reconciles; everything else under `src/` belongs to one preset. */
const SHARED = ['styles', 'lib', 'ui'];

const VITE_CONFIG = `import { defineSkinConfig } from 'build-skin';

export default defineSkinConfig({ dir: import.meta.dirname });
`;

const TSCONFIG = {
  extends: '../../../tsconfig.skin.json',
  compilerOptions: { paths: { '@/*': ['./src/*'] } },
  include: ['src'],
};

interface PackageJson {
  name?: string;
  version?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  [key: string]: unknown;
}

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { name: { type: 'string' }, owner: { type: 'string' } },
});

const [projectArg] = positionals;
if (!projectArg) fail('Usage: node scripts/add-skin/add-skin.ts <project> [--name <slug>] [--owner <github-user>]');

const project = resolve(projectArg);
const manifest = await readJson<SkinManifest>(join(project, 'skin.json')).catch(() =>
  fail(`${project} has no skin.json: pass the folder \`npx @videojs/cli skin create\` made.`)
);
const videojs = workspaceVideojsVersion(repoDir);
const major = videojs.split('.')[0]!;

if (!FRAMEWORKS.includes(manifest.framework)) fail(`Unknown framework "${manifest.framework}" in skin.json.`);
if (!PRESETS.includes(manifest.preset)) fail(`Unknown preset "${manifest.preset}" in skin.json.`);
if (manifest.styling !== 'css' && manifest.styling !== 'tailwind') fail(`Unknown styling "${manifest.styling}".`);
if (manifest.videojs.split('.')[0] !== major) {
  fail(
    `The project targets Video.js ${manifest.videojs}; this repository is on ${videojs}. Recreate it with that CLI.`
  );
}

const slug = values.name ?? kebab(manifest.name);
if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) fail(`"${slug}" is not a slug; pass --name <lowercase-words>.`);

const skinDir = join(SKINS_DIR, slug);
const target = join(skinDir, manifest.framework);
const notes: string[] = [];

if (existsSync(join(target, 'skin.json'))) await mergePreset();
else await copyProject();

await renameTheme(join(target, 'src'));
await writeCatalog();
await writeCodeOwners();

if (manifest.videojs !== videojs) {
  notes.push(`skin.json names Video.js ${manifest.videojs}; the registry build requires ${videojs}.`);
}

const pkg = `@skins/${slug}-${manifest.framework}`;

console.log(`Added ${manifest.preset} to ${relative(repoDir, target)}.`);
for (const note of notes) console.log(`- ${note}`);
console.log(`
Next:
  pnpm install && pnpm -F ${pkg} build && pnpm -F fit-check test -t ${slug}
Then fill in skins/${slug}/catalog.json and run pnpm build:registry.`);

/** First run for this framework: the project minus what intake leaves behind, and the workspace package files. */
async function copyProject(): Promise<void> {
  await mkdir(target, { recursive: true });
  await cp(join(project, 'src'), join(target, 'src'), { recursive: true });
  await cp(join(project, 'skin.json'), join(target, 'skin.json'));
  await writeFile(join(target, 'vite.config.ts'), VITE_CONFIG);
  await writeFile(join(target, 'tsconfig.json'), `${JSON.stringify(TSCONFIG, null, 2)}\n`);
  await writeJson(join(target, 'package.json'), workspacePackage(await readJson(join(project, 'package.json'))));
}

/** A later run for the same framework: add the project's preset to the skin, keeping what the skin already has. */
async function mergePreset(): Promise<void> {
  const existing = await readJson<SkinManifest>(join(target, 'skin.json'));

  for (const key of ['framework', 'styling', 'base'] as const) {
    if (existing[key] !== manifest[key]) {
      fail(`skins/${slug}/${manifest.framework} is ${key} "${existing[key]}"; the project is "${manifest[key]}".`);
    }
  }

  const presetDir = join(target, 'src', manifest.preset);
  if (existsSync(presetDir)) fail(`skins/${slug}/${manifest.framework} already has src/${manifest.preset}/.`);

  await cp(join(project, 'src', manifest.preset), presetDir, { recursive: true });

  for (const folder of SHARED) {
    for (const file of await listFiles(join(project, 'src', folder))) {
      const from = join(project, 'src', folder, file);
      const to = join(target, 'src', folder, file);

      if (!existsSync(to)) {
        await cp(from, to);
        notes.push(`added src/${folder}/${file}`);
      } else if (!(await sameAfterRename(from, to))) {
        notes.push(`kept src/${folder}/${file}, which differs from the project's; compare them by hand`);
      }
    }
  }

  // The new preset may import packages the skin did not need yet; what the skin already declares wins.
  const current = await readJson<PackageJson>(join(target, 'package.json'));
  const incoming = workspacePackage(await readJson(join(project, 'package.json')));

  for (const field of ['dependencies', 'peerDependencies', 'devDependencies'] as const) {
    if (incoming[field]) current[field] = sortKeys({ ...incoming[field], ...current[field] });
  }

  await writeJson(join(target, 'package.json'), current);
}

/**
 * The project's `package.json` as a private workspace package: the Video.js packages and React become peers (the
 * consumer's), with the workspace catalog's versions to build against; other runtime packages (`cn`) stay
 * dependencies; the workbench's devDependencies go. There is no `sideEffects` list: one naming only `dist/` would make
 * the build drop the side-effect imports of `src/<preset>/skin.ts`.
 */
function workspacePackage(source: PackageJson): PackageJson {
  const react = manifest.framework === 'react';
  const peerDependencies: Record<string, string> = {};
  const dependencies: Record<string, string> = {};
  const devDependencies: Record<string, string> = {
    'build-skin': 'workspace:*',
    typescript: '^5',
    'vite-plus': 'catalog:',
  };

  for (const [name, range] of Object.entries(source.dependencies ?? {})) {
    if (name.startsWith('@videojs/')) {
      peerDependencies[name] = `^${major}`;
      devDependencies[name] = 'catalog:';
    } else if (name === 'react') {
      peerDependencies[name] = '^18 || ^19';
      devDependencies[name] = range;
    } else dependencies[name] = range;
  }

  if (react) devDependencies['@types/react'] = source.devDependencies?.['@types/react'] ?? '^19.3.0';
  if (manifest.styling === 'tailwind') {
    devDependencies.tailwindcss = source.devDependencies?.tailwindcss ?? '^4.3.3';
  }

  return {
    name: `@skins/${slug}-${manifest.framework}`,
    version: source.version ?? '0.0.0',
    private: true,
    type: 'module',
    scripts: { build: 'vp build', typecheck: 'tsc --noEmit' },
    ...(Object.keys(dependencies).length ? { dependencies: sortKeys(dependencies) } : {}),
    devDependencies: sortKeys(devDependencies),
    peerDependencies: sortKeys(peerDependencies),
  };
}

/**
 * `skin create` keys every theme rule, icon family and container on the base's name (`scaffold`, `default`), so two
 * skins from one base, or a skin and the first-party default, would style each other on one page. Rename the base to
 * the skin's slug wherever it is the theme: `data-theme`, `registerIcons()` and `<media-icon family>`.
 */
async function renameTheme(src: string): Promise<void> {
  if (manifest.base === slug) return;

  for (const file of await listFiles(src)) {
    if (!/\.(css|ts|tsx|html)$/.test(file)) continue;

    const path = join(src, file);
    const text = await readFile(path, 'utf8');
    const renamed = renameBase(text);

    if (renamed !== text) await writeFile(path, renamed);
  }
}

function renameBase(text: string): string {
  const base = manifest.base;
  const patterns: [string, string][] = [
    [`data-theme="${base}"`, `data-theme="${slug}"`],
    [`registerIcons('${base}'`, `registerIcons('${slug}'`],
    [`family="${base}"`, `family="${slug}"`],
  ];

  return patterns.reduce((result, [from, to]) => result.replaceAll(from, to), text);
}

/** The skin's copy of a shared file was renamed on intake, so the project's copy is compared renamed too. */
async function sameAfterRename(from: string, to: string): Promise<boolean> {
  const [incoming, existing] = await Promise.all([readFile(from, 'utf8'), readFile(to, 'utf8')]);

  return renameBase(incoming) === existing;
}

async function writeCatalog(): Promise<void> {
  const path = join(skinDir, 'catalog.json');
  if (existsSync(path)) return;

  await writeJson(path, {
    title: manifest.name,
    description: '',
    author: { name: '', github: values.owner ?? '' },
  });
  notes.push(`created skins/${slug}/catalog.json; fill in the description and the author's name`);
}

async function writeCodeOwners(): Promise<void> {
  if (!values.owner) {
    notes.push(`TODO: no --owner, so .github/CODEOWNERS has no line for /skins/${slug}/`);
    return;
  }

  const path = join(repoDir, '.github/CODEOWNERS');
  const line = `/skins/${slug}/ @${values.owner.replace(/^@/, '')}`;
  const current = existsSync(path) ? await readFile(path, 'utf8') : '';

  if (current.split('\n').some((existing) => existing.startsWith(`/skins/${slug}/ `))) return;

  await writeFile(path, `${current}${current && !current.endsWith('\n') ? '\n' : ''}${line}\n`);
}

/** Every file under `dir`, as paths relative to it; nothing when it does not exist. */
async function listFiles(dir: string): Promise<string[]> {
  if (!existsSync(dir)) return [];

  const entries = await readdir(dir, { recursive: true, withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => relative(dir, join(entry.parentPath, entry.name)))
    .sort();
}

function kebab(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function sortKeys(record: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(record).sort(([a], [b]) => a.localeCompare(b)));
}

async function readJson<T = PackageJson>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, 'utf8')) as T;
}

async function writeJson(path: string, value: unknown): Promise<void> {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
}

function fail(message: string): never {
  console.error(`add-skin: ${message}`);
  process.exit(1);
}
