#!/usr/bin/env node
/*
 * Publishes every skin under `skins/*` and then the root `player.style` package, skipping private packages and
 * versions that are already on npm. Runs after `pnpm build:skins`, from the repository root, in CD once release-please
 * has cut the releases.
 *
 * The workspace is managed by pnpm, but each package is published with `npm publish` from its own directory so npm's
 * `--provenance` attestation works unchanged. The dist-tag defaults to `next`: the 1.x alphas must not take `latest`
 * from the Media Chrome editions until Video.js 10 is GA, when `latest` is moved by hand (`npm dist-tag add`).
 */
import { exec } from 'node:child_process';
import { readdir, readFile, realpath } from 'node:fs/promises';
import { join } from 'node:path';
import { argv, env, exit } from 'node:process';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

const DEFAULT_TAG = 'next';

/** The skins first, so the root package never publishes ahead of a skin it depends on. */
export async function packageDirs(root = '.') {
  const skins = (await readdir(join(root, 'skins'), { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(root, 'skins', entry.name))
    .sort();

  return [...skins, root];
}

/** Whether `name@version` is already on the registry; `npm view` exits non-zero when the package or version is unknown. */
export async function isPublished(name, version) {
  try {
    const { stdout } = await execAsync(`npm view ${name}@${version} version --json`);

    return JSON.parse(stdout) === version;
  } catch {
    return false;
  }
}

export async function publish({ tag = env.PUBLISH_TAG || DEFAULT_TAG, dryRun = false } = {}) {
  const published = [];

  for (const dir of await packageDirs()) {
    const { name, version, private: isPrivate } = JSON.parse(await readFile(join(dir, 'package.json'), 'utf8'));
    if (isPrivate) continue;

    if (await isPublished(name, version)) {
      console.log(`Skipping ${name}@${version}: already published`);
      continue;
    }

    // Lifecycle scripts are skipped because the build already ran; the root's `prepare` would otherwise run again.
    const flags = ['--access public', '--provenance', `--tag ${tag}`, '--ignore-scripts', dryRun ? '--dry-run' : ''];

    console.log(`Publishing ${name}@${version} to dist-tag "${tag}"`);
    const { stdout, stderr } = await execAsync(`npm publish ${flags.filter(Boolean).join(' ')}`, { cwd: dir });
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);

    published.push(`${name}@${version}`);
  }

  return published;
}

const isCli = (await realpath(argv[1])) === (await realpath(fileURLToPath(import.meta.url)));

if (isCli) {
  try {
    const published = await publish({ dryRun: argv.includes('--dry-run') });

    console.log(published.length ? `Published ${published.join(', ')}` : 'Nothing to publish');
  } catch (error) {
    console.error(error);
    exit(1);
  }
}
