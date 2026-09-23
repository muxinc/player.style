#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { argv } from 'node:process';
import { readdir, readFile, realpath } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

const nodePath = await realpath(argv[1]);
const modulePath = await realpath(fileURLToPath(import.meta.url));
const isCLI = nodePath === modulePath;

if (isCLI) cliPublish();

export async function cliPublish() {
  const { values } = parseArgs({
    options: {},
    strict: false,
    allowPositionals: true,
  });

  await publish(values);
}

export async function publish() {
  // The workspace is managed by pnpm, so npm's `-w` workspace flags are unavailable. Publish the root package and each
  // theme from its own directory with npm to keep `--provenance` behavior unchanged.
  const packageDirs = ['.', ...(await readdir('themes', { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => join('themes', entry.name))];

  for (const dir of packageDirs) {
    const { name, version, private: isPrivate } = JSON.parse(await readFile(join(dir, 'package.json'), 'utf8'));
    if (isPrivate) continue;

    let remoteVersion;
    try {
      const { stdout } = await execAsync(`npm view ${name} version --json`);
      remoteVersion = JSON.parse(stdout);
    } catch {
      // `npm view` exits non-zero with E404 when the package has never been published.
      remoteVersion = undefined;
    }

    if (remoteVersion === version) {
      console.log(`Skipping ${name}@${version} because it's already published`);
      continue;
    }

    console.log(`Publishing ${name}@${version}`);
    await execAsync(`npm publish --access public --provenance`, { cwd: dir });
  }
}
