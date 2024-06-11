#!/usr/bin/env node
import { parseArgs } from 'node:util';
import process from 'node:process';
import { join, dirname } from 'node:path';
import { realpath, mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const nodePath = await realpath(process.argv[1]);
const modulePath = await realpath(fileURLToPath(import.meta.url));
const isCLI = nodePath === modulePath;

if (isCLI) cliBuild();

export async function cliBuild() {
  const { values, positionals } = parseArgs({
    options: {},
    strict: false,
    allowPositionals: true,
  });

  await build(positionals, values);
}

export async function build() {
  // read name from package.json
  const { name } = JSON.parse(await readFile('./package.json', 'utf8'));

  if (name.startsWith('@player.style/')) {

    const themeName = name.replace('@player.style/', '');

    await mkdir('./dist', { recursive: true });

    // // copy wrapper file templates/media-theme-element.js to root folder and replace vars.
    let mediaTheme = await readFile(join(dirname(modulePath), '/templates/media-theme-element.js'), 'utf8');
    mediaTheme = mediaTheme.replace(/{{{theme_name}}}/g, themeName);

    let themeTemplate = await readFile('./template.html', 'utf8');
    themeTemplate = themeTemplate.replace(/^(.)/gm, '  $1');
    mediaTheme = mediaTheme.replace(/{{{theme_template}}}/g, themeTemplate);

    await writeFile(`./dist/${themeName}.js`, mediaTheme);
  }
}
