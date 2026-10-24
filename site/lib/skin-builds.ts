import { parseSkinBuildPath, skinBuildKey } from 'build-skin/names';

/**
 * Every built preset module of every skin package (`skins/<name>/<framework>/dist/<preset>.js`), found by glob and
 * loaded only when called, so a skin's code and CSS reach the page only when one of its previews renders. Only the
 * client previews import it: in the server graph the modules would compile as server components.
 *
 * Turbopack matches a glob only from `./` with `base` set (a pattern starting `../` matches nothing), and Turbopack and
 * Vitest key the results differently, so the maps are re-keyed `<name>/<framework>/<preset>`. The patterns name
 * `react` and `html`, so no dependency's `dist/` can match.
 */
const react = import.meta.glob('./skins/*/react/dist/*.js', { base: '../..' });
const html = import.meta.glob('./skins/*/html/dist/*.js', { base: '../..' });

function byKey<Value>(modules: Record<string, Value>): Record<string, Value> {
  return Object.fromEntries(
    Object.entries(modules).flatMap(([path, value]) => {
      const build = parseSkinBuildPath(path);

      return build ? [[skinBuildKey(build.name, build.framework, build.preset), value]] : [];
    })
  );
}

export const REACT = byKey(react);
export const HTML = byKey(html);
