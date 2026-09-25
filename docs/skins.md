# Adding a skin

A third-party skin in this repository is a package under `skins/<name>`, published as `@player.style/<name>`. It
contains a shadow-DOM custom element for HTML, a light-DOM React component, and one stylesheet shared by both. The
build also emits the skin's open files (`dist/open`), the source files a project can copy or pull through the shadcn
registry. `skins/microvideo` and `skins/microvideo-live` are the reference: copy the closest existing skin rather than
starting from scratch.

## Layout

```
skins/<name>/
  package.json            @player.style/<name>
  README.md               HTML and React usage, a Theming table, peer dependencies
  tsconfig.json           typecheck: src, tests, vite.config.ts (noEmit)
  tsconfig.build.json     declarations only: src -> dist/types
  vite.config.ts          defineSkinConfig({ dir: import.meta.dirname })
  src/skin.css            the one stylesheet
  src/html/template.html  the shadow-root markup
  src/html/index.ts       defines <<name>-skin>
  src/react/index.tsx     'use client'; export function <Name>Skin
  tests/skin.test.ts      parity and packaging guards
```

Names follow the slug everywhere: tag `<name>-skin`, element class `<Name>SkinElement`, component `<Name>Skin` with
`<Name>SkinProps`, root class and container name `ps-<name>`, every other class `ps-*`. The site, the registry and the
build derive names from the slug, so keep to it.

## `package.json`

- `name` `@player.style/<name>`, `version` `1.0.0-alpha.0`, `license` MIT, `type: module`, `files: ["dist"]`, and
  `homepage` `https://player.style/skins/<name>` with `repository.directory` `skins/<name>`.
- `exports`: `./html` and `./react` (each with `types` under `dist/types/{html,react}/index.d.ts`), `./skin.css`,
  `./open/*` and `./package.json`. There is no bare `.` entry, so neither framework reads as the default. The shared
  build-skin tests fail on a bare entry.
- `sideEffects: ["./dist/html.js", "./dist/skin.css"]`: the HTML entry defines the element on import, and
  `import '@player.style/<name>/skin.css'` is a bare import that webpack drops under tree shaking unless it is listed.
  The shared build-skin tests require both entries.
- `peerDependencies`: `@videojs/html` and `@videojs/react` pinned exactly at `10.0.0-rc.2`, and `react` at
  `^18 || ^19`, all optional in `peerDependenciesMeta`. The same pins go in `devDependencies`, next to `build-skin`
  (`workspace:*`). The registry build fails if any skin's pin is not exact or disagrees with the others.
- Scripts: `build` (`vp build && tsc -p tsconfig.build.json`), `test`, `typecheck`, `clean`. Copy them from a sibling.

## HTML entry

`src/html/template.html` is the markup the element stamps into its shadow root. The root is
`<media-container class="media-skin ps-<name>" data-theme="<name>" data-preset="video|audio">`. Inside it go a
default `<slot>` for the page's media element, and a `media-poster` wrapping `<slot name="poster">` with an `<img>`
fallback. Then add the Video.js UI elements: `media-controls` / `media-controls-content`, buttons, sliders,
`media-hotkey`, `media-gesture`, `media-error-dialog`. Draw icons as inline SVGs inside the buttons, one per state with
no `slot` attributes, and toggle them from data attributes in CSS.

`src/html/index.ts`:

- imports one `@videojs/html/ui/<element>` module for every element the template uses, and nothing else. `ui/tooltip`
  also needs `ui/tooltip-label` and `ui/tooltip-shortcut`, which it creates at runtime without registering them;
- imports the template with `?raw` and the stylesheet with `?inline`;
- defines the element: `attachShadow({ mode: 'open' })`, one shared `CSSStyleSheet` holding the `:host` rules and the
  stylesheet adopted by every instance (with a `<style>` fallback), and a clone of the template. It is guarded by
  `typeof HTMLElement` for server runtimes and by `customElements.get` against double definition. Video.js does not
  export its own skin element base class, so copy this host from a sibling; only the tag name and the import list
  change.

The open-files build reads the `@videojs/html` imports (and any `registerIcons()` call) straight out of this file.
Keep them there, not in a module it imports.

Host attributes that switch layouts (microvideo's `controlbarplace`, `controlbarvertical`) are `observedAttributes`,
mirrored onto the container as `data-*`. The React component sets the same data attributes from camel-cased props, so
one set of CSS rules serves both. Microvideo keeps that host in `src/skin-element.ts`.

## React entry

`src/react/index.tsx` starts with `'use client';` (the build and the tests check it). It exports
`<Name>SkinProps` (usually `ContainerProps`) and `<Name>Skin`, which renders `Container` with the same root classes,
`data-theme` and `data-preset`. Inside it goes the same tree as the template: the same primitives in the same order,
the same class names, the same SVG paths. The media comes in as `children`, and the poster is `Poster.Root` +
`Poster.Image` fed by the player's `poster`. It does not import the stylesheet; consumers import
`@player.style/<name>/skin.css`.

Attributes map one to one (`seconds="-10"` becomes `seconds={-10}`). Anything that exists in one framework only, such
as a `byline` slot in HTML versus a `byline` prop in React, or tooltip ids, is listed in the test so the difference
stays deliberate. Use `useId()` for any `<mask>` or `<clipPath>` id, since several players can share a page.

## Stylesheet

`src/skin.css` is adopted into the shadow root by the HTML entry and imported globally by React users, often
alongside other skins. Hence:

- **Class selectors only.** HTML renders custom elements where React renders native ones, so a tag selector styles one
  framework and not the other.
- **Scope every rule** under `:where(.ps-<name>)` (no added specificity), or start it at `.ps-<name>`. Prefix
  keyframe names `ps-<name>-`, since keyframes are global.
- **Match the media twice**: `.ps-<name> > video` for React's light DOM and `.ps-<name> ::slotted(video)` for the
  shadow root (the same for `audio` and a slotted poster image). An audio skin hides its media with
  `.ps-<name> ::slotted(:not([slot]))` rather than `::slotted(audio)`: a Mux or HLS source slots `<mux-audio>`, whose
  inline box otherwise adds an empty line to the HTML element only. The shared tests check it.
- **Reset native buttons** (margin, padding, border, background, `font: inherit`, `appearance: none`), and add
  `.ps-<name> [hidden] { display: none !important }`.
- **State is data attributes**: `data-paused`, `data-volume-level`, `data-fullscreen`, `data-visible` on controls and
  poster, `data-pointing` / `data-dragging` on sliders, and `data-hidden` / `data-availability` on buttons the media
  cannot use (hide them). Sliders expose `--media-slider-fill`, `--media-slider-buffer` and `--media-slider-pointer`.
- **Breakpoints are container queries.** Put `container: ps-<name> / inline-size` on the root and write
  `@container ps-<name> (inline-size >= 480px)`. The root cannot match its own query, so put responsive values on a
  descendant.
- **Video skins** set `aspect-ratio: 16 / 9`, `overflow: clip` and `isolation: isolate` on the root. Exceptions are
  skins that follow their media (`height: 100%`, no ratio), fixed-size skins, and audio skins, whose height follows
  their content.

Video.js 10 behaviours that are easy to trip over:

- A slider maps the pointer and its fill across its root box. Keep padding off the slider: put gaps on it as margins
  inside a wrapper, and add hit area with a `::before` on the root.
- Tag each menu `pointer-events: auto`. Inside `media-controls-content` a popup otherwise inherits `none` from it, and
  clicks fall through.
- Menu offsets are `--media-popover-side-offset` and `--media-popover-align-offset` on the menu element. Size menu
  items with `min-height`, never `height`, and do not rotate or scale a popup's starting style.
- Controls fade while the pointer rests on them. Add `:not(:has(<controls>:hover))` to the hidden-layer rules if the
  skin should stay up.
- Set `formatRate` on the HTML rate radio group after `customElements.upgrade()`, and `delay` on each tooltip rather
  than on the group.

## Theming

A skin honours `--media-primary-color`, `--media-secondary-color` and `--media-accent-color` with its own defaults.
It also honours `--media-font-family`, `--media-border-radius`, `--media-object-fit` and `--media-object-position`
wherever it has something they apply to. The skin's main brand colour is declared once on the root as a private
property routed through the accent:

```css
.ps-<name> {
  --ps-accent: var(--media-accent-color, #e5091a);
}
```

Use that property wherever the brand colour paints, so setting `--media-accent-color` recolours the skin; the site's
colour picker relies on it. If the brand colour used to come from another token, keep that token as the fallback
(`var(--media-accent-color, var(--media-primary-color, #fff))`). Keep skin-specific knobs as `--ps-*` properties. The
README's Theming table lists each token, what it colours and its default, and `tests/skin.test.ts` asserts the root
declaration.

## Live video use case

A skin that should also serve the live video use case gets a sibling package, `skins/<name>-live`, published as
`@player.style/<name>-live`, on the Video.js live-video preset (`<live-video-player>`, `LiveVideoPlayer`).

- It has every file above except `src/skin.css`. Its `vite.config.ts` is
  `defineSkinConfig({ dir: import.meta.dirname, stylesheet: '../<name>/src/skin.css' })`, and its HTML entry imports
  `'../../../<name>/src/skin.css?inline'`. The build copies that file to `dist/skin.css` and `dist/open/skin.css`, so
  both packages ship the same stylesheet and each installs on its own.
- Names: `<name>-live-skin`, `<Name>LiveSkinElement`, `<Name>LiveSkin`, `<Name>LiveSkinProps`. The root keeps
  `class="media-skin ps-<name>" data-theme="<name>"` and adds `data-preset="live-video"`. Live-only rules live in the
  base stylesheet, keyed on `.ps-<name>[data-preset="live-video"]`.
- Drop the time slider, seek buttons and seek hotkeys, and put a `media-live-button` / `LiveButton` with its own text
  (`<span>Live</span>`) where the live indicator belongs. Style its dot from `data-live-edge`, with
  `--media-live-button-icon-color` and `--media-live-button-indicator-color` as tokens.
- The package keeps its own copy of the shadow-root host, since nothing is imported across package directories
  except the stylesheet. Its test checks the copy against the sibling's, runs the parity checks against the shared
  stylesheet, and checks the dropped controls against the sibling's template.
- `package.json` mirrors the base package's under the live name, homepage and `repository.directory`.

## Build output and open files

`scripts/build-skin` owns the Vite library config (`defineSkinConfig`): ES modules, the Video.js packages and React
external, no minification. It emits:

```
dist/html.js  dist/react.js  dist/types/{html,react}/index.d.ts  dist/skin.css
dist/open/skin.html  skin.css  register.ts  Skin.tsx  README.md
```

The open files are generated, never edited by hand:

- `skin.html` is the template as light-DOM markup: the default slot becomes
  `<!-- Add a compatible media element here. -->`, and each named slot becomes a `<!-- name -->` marker followed by
  its fallback.
- `skin.css` is a copy of the stylesheet.
- `register.ts` holds the entry's `@videojs/html` imports.
- `Skin.tsx` is the React source with a provenance line under `'use client'`.
- `README.md` gives paste instructions for the skin's preset, read from `data-preset`.

Keep `template.html` and the React file self-contained, because they are copied verbatim. `pnpm build:registry`
(`scripts/build-registry`) turns every `dist/open` into two shadcn items named after the skin directory. The React
item carries `Skin.tsx` + `skin.css` and depends on `@videojs/react@<pin>`. The HTML item carries `skin.html` +
`register.ts` + `skin.css` and depends on `@videojs/html@<pin>`. Title, description and docs come from
`package.json`. There is nothing to register by hand.

## Tests

`tests/skin.test.ts` (copy the closest sibling's and adapt it) checks that:

- the stylesheet uses class selectors only, scopes every rule under the root, matches the media twice, and declares
  the brand property from `--media-accent-color`. Its helpers strip at-rule preludes, `@keyframes` blocks and
  `data:` URLs before splitting selectors;
- the template roots in the right `media-container`, exposes the default and poster slots, and the entry registers
  exactly the elements the template uses;
- the React tree draws the same SVG paths and uses the same class names as the template, and is a client component
  on the right preset;
- `package.json` has the export map, `sideEffects` and pinned peers above.

The shared tests in `scripts/build-skin/tests/` cover the build helpers. After `pnpm build:skins` they also check
every skin's `dist/open`: one media placeholder and no slots, every element registered and resolvable, a client
`Skin.tsx`, and live-video docs for a live package. They also check every package's export map and `sideEffects`,
that the root package lists every package with both side effects, and that an audio skin hides its whole default slot.

## Registering on the site

- `site/lib/skins.ts`: one `ported({ ... })` entry per Media Chrome theme, or `thirdParty({ ... })` for a skin that
  never was one (the recreations of other players' skins), with `slug`, `title`, `description`, `author` and
  `useCase` (`'video'` or `'audio'`); the gallery sorts cards by title. Add `live: true` when the `-live` sibling
  exists: the same card then covers the live video use case. Optional fields are `preview` (`fixedSize`, `metadata` for a
  title and byline, `portrait`), and `legacyTheme` when the Media Chrome theme had another slug.
- A loader per package in `site/lib/third-party/<name>.tsx` (and `<name>-live.tsx`). It is a client module that
  imports the component and the package's `skin.css` and default-exports the component.
- Its line in `site/lib/third-party-previews.tsx`, keyed by the package basename.
- `"@player.style/<name>": "workspace:*"` in `site/package.json`. Add the dependency only once the package directory
  exists, because `pnpm install` fails on a missing workspace package.

The site build fails, naming the file to add, when a listed package has no loader.

## Root package and releases

- Root `package.json`: `"@player.style/<name>": "1.0.0-alpha.0"` in `dependencies` (an exact version, since
  `npm publish` does not rewrite `workspace:`), and `./skins/<name>/dist/html.js` and `./skins/<name>/dist/skin.css` in
  `sideEffects`, kept sorted. The wildcard exports already serve `player.style/<name>/html`, `/react`, `/skin.css` and
  `/open/*`.
- `.github/release-please/release-please-config.json`: a `skins/<name>` entry with
  `component: "@player.style/<name>"`, `prerelease: true`, `prerelease-type: "alpha"`, `versioning: "prerelease"`.
  Also add `"skins/<name>": "1.0.0-alpha.0"` to `.github/release-please/.release-please-manifest.json`. The
  `node-workspace` plugin bumps the root's exact dependency with each skin release.
- CD publishes every `skins/*` package and then the root, when its version is not on npm yet, under the `next`
  dist-tag. The same names carry the Media Chrome themes (0.x) under `latest` until Video.js 10 is GA. A package that
  has never been published needs its first publish, or its npm trusted publisher, set up by hand.

## Examples

`examples/*` are small apps that install the skins the way a user does: `workspace:*` dependencies resolved through
each package's export map to its built `dist`, never its sources. They are smoke tests for packaging, so a broken
`exports` entry, a missing `skin.css` or a `sideEffects` list that no longer matches `dist/html.js` fails a build
before publish. `pnpm build:examples` (after `pnpm build:skins`; CI runs both) builds them, and
`examples/verify-dist.mjs` then checks that every skin's stylesheet and custom element survived bundling, which a
bundler would otherwise tree-shake without a word.

- `examples/html`: a Vite vanilla TypeScript page with YT, Sutro Audio and Microvideo Live on the video, audio and
  live-video players, written as plain markup.
- `examples/sandbox`: a Vite + React app with selects for skin (all 25 packages), framework (React component, or the
  HTML element rendered inside React), source (MP4, HLS, the Mux live stream) and accent colour, kept in the URL.

Run one with `pnpm -F example-sandbox dev` (or `example-html`), after `pnpm build:skins`. A new skin package goes into
the sandbox's `dependencies` and its `src/skins.ts` list.

## Commands

```sh
pnpm install                              # links the new package
pnpm -F @player.style/<name> build        # or pnpm build:skins for all of them
pnpm -F @player.style/<name> test
pnpm build:registry                       # after build:skins
pnpm build:examples                       # after build:skins: the apps under examples/*
pnpm typecheck
pnpm test                                 # includes the shared checks over every dist/open
pnpm lint
pnpm format && pnpm format:check          # vp fmt skips Markdown
npm pack --dry-run                        # what the root package ships
pnpm build                                # skins, registry, then the site
```

CI runs the same sequence.
