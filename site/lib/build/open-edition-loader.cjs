/*
 * Turbopack loader behind `?open` imports of a skin's `open/skin.html`: reads every file beside it and exports them as
 * one `{ [fileName]: text }` object, so a page can show an open edition without touching the filesystem at request
 * time. The import goes through the package's `./open/*` export, so a skin that has not built its open edition fails
 * the build here rather than rendering an empty file switcher.
 */
const { readdirSync, readFileSync, statSync } = require('node:fs');
const { dirname, join } = require('node:path');

module.exports = function openEditionLoader() {
  const dir = dirname(this.resourcePath);
  const files = {};

  for (const name of readdirSync(dir).sort()) {
    const file = join(dir, name);
    if (!statSync(file).isFile()) continue;

    this.addDependency?.(file);
    files[name] = readFileSync(file, 'utf8');
  }

  return `export default ${JSON.stringify(files)};`;
};
