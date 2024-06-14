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

    // Copy declaration file to dist folder
    let declaration = await readFile(join(dirname(modulePath), '/templates/media-theme.d.ts'), 'utf8');
    await writeFile(`./dist/media-theme.d.ts`, populate(declaration, themeName));

    // Copy code file to dist folder and replace vars.
    let code = await readFile(join(dirname(modulePath), '/templates/media-theme.js'), 'utf8');

    let themeTemplate = await readFile('./template.html', 'utf8');
    themeTemplate = themeTemplate.replace(/^(.)/gm, '    $1');
    code = code.replace(/{{{theme_template}}}/g, themeTemplate);

    await writeFile(`./dist/media-theme.js`, populate(code, themeName));

    // React component

    // Copy declaration file to dist folder.
    declaration = await readFile(join(dirname(modulePath), '/templates/react.d.ts'), 'utf8');
    await writeFile(`./dist/react.d.ts`, populate(declaration, themeName));

    // Copy code file to dist folder and replace vars.
    code = await readFile(join(dirname(modulePath), '/templates/react.js'), 'utf8');
    await writeFile(`./dist/react.js`, populate(code, themeName));
  }
}

function populate(template, themeName) {
  return template
    .replace(/{{{element_name}}}/g, `media-theme-${themeName}`)
    .replace(/___ClassName___/g, `MediaTheme${pascalCase(themeName)}Element`)
    .replace(/___ComponentName___/g, `MediaTheme${pascalCase(themeName)}`);
}

function pascalCase(str) {
  return `-${str}`.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}
