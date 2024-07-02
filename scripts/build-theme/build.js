#!/usr/bin/env node
import { parseArgs } from 'node:util';
import process from 'node:process';
import { join, dirname } from 'node:path';
import { realpath, mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import ejs from 'ejs';

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
    const declaration = await readFile(
      join(dirname(modulePath), '/templates/media-theme.d.ts'),
      'utf8'
    );
    await writeFile(`./dist/media-theme.d.ts`, populate(declaration, themeName));

    const themeTemplate = await readFile('./template.html', 'utf8');
    const outThemeTemplate = ejs.render(
      themeTemplate,
      { themeName },
      { root: join(process.cwd(), 'dist') }
    );
    await writeFile(`./dist/media-theme.html`, outThemeTemplate);

    // Copy code file to dist folder and replace vars.
    const themeCode = await readFile(
      join(dirname(modulePath), '/templates/media-theme.js'),
      'utf8'
    );
    const indentedThemeTemplate = outThemeTemplate.replace(/^(.)/gm, '    $1');
    const outThemeCode = themeCode.replace(/{{{theme_template}}}/g, indentedThemeTemplate);
    await writeFile(`./dist/media-theme.js`, populate(outThemeCode, themeName));

    // React component

    // Copy declaration file to dist folder.
    const reactDeclaration = await readFile(
      join(dirname(modulePath), '/templates/react.d.ts'),
      'utf8'
    );
    await writeFile(`./dist/react.d.ts`, populate(reactDeclaration, themeName));

    // Copy code file to dist folder and replace vars.
    const reactCode = await readFile(join(dirname(modulePath), '/templates/react.js'), 'utf8');
    await writeFile(`./dist/react.js`, populate(reactCode, themeName));
  }
}

function populate(template, themeName) {
  return template
    .replace(/{{{element_name}}}/g, `media-theme-${themeName}`)
    .replace(/___ClassName___/g, `MediaTheme${pascalCase(themeName)}Element`)
    .replace(/___ComponentName___/g, `MediaTheme${pascalCase(themeName)}`);
}

function pascalCase(str) {
  return `-${str}`.replace(/-(\w)/g, (g) => g[1].toUpperCase());
}
