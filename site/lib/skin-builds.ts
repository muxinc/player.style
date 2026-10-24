/**
 * A loader for every built preset module of every skin package (`skins/<name>/<framework>/dist/<preset>.js`), keyed
 * `<name>/<framework>/<preset>`, so a skin's code and CSS reach the page only when one of its previews renders. Only
 * the client previews import it: in the server graph the modules would compile as server components.
 *
 * Every skin build writes the loaders as one literal `import()` per module (`writeSkinBuildIndex` in
 * scripts/build-skin): Turbopack splits each into a chunk of its own, where an `import.meta.glob` over the skins put
 * all of them in the chunks every page loads.
 */
export { default as SKIN_LOADERS } from './generated/skin-loaders';
