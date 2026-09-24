# site — friction log

Round 2 site work: classic demo media, first-party install button, the third-party install flow (media, framework,
packaged/open, snippets), live cards, and the open-edition file viewer. Date: 2026-09-24.

Severity: **blocker** (no port without it), **workaround** (ported differently), **papercut** (cost time only).

## CDN verdict: left out

The brief allowed a CDN tab under HTML only if `@player.style/*` from jsDelivr coexists with `@videojs/cdn` in a real
test. It does not, so the framework picker offers npm installs only. Evidence (scratch pages under the session
scratchpad, `cdn-test/`, served with a static server standing in for jsDelivr; screenshots `a-no-importmap.png`,
`b-importmap-video-js.png`, `c-importmap-ui.png`):

1. **Exactly what the CDN guide offers** (`<script type="module" src=".../@videojs/cdn@10.0.0-rc.2/video.js">`
   followed by our `dist/html.js`): `TypeError: Failed to resolve module specifier "@videojs/html/ui/container"`.
   `<yt-skin>` is never defined. Every skin's `dist/html.js` has 45–50 bare `@videojs/html/ui/*` imports, and the
   guide publishes no import map.
2. **Import map to `@videojs/cdn@10.0.0-rc.2/ui/<element>.js`** (the per-element bundles `packages/cdn` on the v10
   main branch exports as `./ui/*`): every one 404s. The jsDelivr file listing for rc.2 has root bundles,
   `extensions/`, `media/`, and `locales/`, but no `ui/` directory; those bundles are unreleased.
3. **Import map pointing all 45 specifiers at `video.js`**: `<yt-skin>` upgrades and renders (the elements the default
   skin composes are registered by that bundle), but it is not a real coexistence. Across the fourteen skins, three
   elements are registered by none of the published `video.js`, `audio.js`, or `live-video.js` bundles:
   `media-time-group` and `media-time-separator` (demuxed-2022, reelplay, sutro, yt) and `media-title` (essentials,
   notflix, sutro-audio, vimeonova). The page renders them as unknown elements. Shipping this would mean a per-skin
   import map that has to be re-verified against every Video.js release.

Also: `@player.style/<name>@1.0.0-alpha.0` is not on npm yet (the `@player.style/*` names still resolve to the
0.x Media Chrome editions), so any CDN snippet would have pointed at unpublished files regardless. Revisit once
`@videojs/cdn` ships `ui/*` and the skins are published; the snippet would then need an import map from
`@videojs/html/ui/` to `@videojs/cdn@<version>/ui/` plus `.js` suffixes, which import maps cannot add, so a per-skin
map generated from `dist/html.js` remains the only option.

## Entries

1. **Classic asset has no `highest.mp4` and no `audio.m4a`** — workaround. `stream.mux.com/fXNz…/highest.mp4` and
   `/audio.m4a` return 404 for both the landscape and portrait assets; `high.mp4`, `medium.mp4`, `low.mp4` and the
   HLS manifest exist (older assets predate the `highest` rendition name and have no audio-only static rendition).
   Previews play `high.mp4` for video and the HLS stream through `MuxAudio` for audio skins, so every card works.
   The audio snippets' "Audio file" option still points at `/audio.m4a` as agreed; enabling the audio-only static
   rendition on the Mux asset makes it resolve. Worth doing on the Mux side rather than changing the URL here.
2. **No Wistia in the media picker** — as specified. The brief said to add Wistia if v10's renderer list has it;
   `INSTALLATION_PRESETS` in `site/src/utils/installation/types.ts` does not (the package and a demo URL exist, the
   picker entry does not), so the list mirrors v10 exactly: Video file, HLS, DASH, Mux, Vimeo, YouTube, Cloudflare
   Stream, TikTok, Twitch.
3. **Svelte needs no compiler configuration** — as v10 documents. `installation-svelte.mdx` says Svelte passes
   hyphenated tags through; only Vue gets the `isCustomElement` config (`vite.config.ts` / `nuxt.config.ts` tabs).
   The brief expected both to carry a config snippet; the site follows the v10 guide.
4. **Turbopack cannot `?raw`-import the open edition** — workaround, an hour. Next 16's Turbopack has no built-in
   raw import (`Unknown module type`), and a `turbopack.rules` entry conditioned on `query: /^\?raw$/` works for
   `.html`, `.ts`, and `.tsx` but `.css` fails to resolve under any rule (`Can't resolve '@player.style/yt/open/skin.css'`,
   also with a relative path), because CSS goes through Next's own pipeline. The site now imports
   `@player.style/<name>/open/skin.html?open` through one local loader (`site/lib/build/open-edition-loader.cjs`)
   that reads every file beside `skin.html` and exports them as one object, so `skin.css` never goes through CSS
   resolution and no filesystem access happens at request time. The import resolves through the package's
   `./open/*` export, so a skin without a built open edition fails the build with the import path.
5. **A `'use client'` registry cannot be read by a build-time guard** — papercut. `generateStaticParams` checks that
   every listed third-party skin has a preview loader and an open edition, so a live card without its dist fails
   `next build` with the file to add instead of rendering blank. Calling `hasThirdPartyPreview()` from a
   `'use client'` module throws on the server; the registry is now a shared module (no directive) whose loaders are
   the client modules.
6. **Package-manager tabs** — scope. The install line is npm only: `CodeFrame` had no tab support and the brief said
   to ship npm alone in that case. `CodeTabs` now exists (file switcher for Vue/Svelte and the open files), so a
   pnpm/yarn/bun set is a small follow-up.
7. **Live editions are sibling packages** — convention change mid-round. Live cards were first wired to
   `@player.style/<name>/live` subpaths; Darius then settled on sibling packages, `@player.style/<name>-live`, with
   their own `/react`, `/skin.css`, and `open/*`. The card model keeps `edition: 'live'` and derives the base skin from
   the name (`getBaseSkin`), the names come from the package basename like any other skin (`<name>-live-skin`,
   `NameLiveSkin`), and `site/package.json` lists all four live packages as `workspace:*`. The HTML entry lives in one
   helper (`getHtmlEntry` in `third-party-usage.ts`) because it is due to move to `/html`.
8. **Live previews** — two of four wired. At hand-off `essentials-live` and `demuxed-2022-live` had complete dists
   and are wired (loader in `site/lib/third-party/<name>-live.tsx`, open edition in `site/lib/open-editions.ts`);
   `microvideo-live` and `x-mas-live` existed as packages without a `dist`. `site/package.json` depends on all four
   (`workspace:*`; note a dependency on a package directory that does not exist yet fails `pnpm install`, which every
   `vp` command runs first, for the whole repository, which is why the dependency followed the directory). All four
   cards are declared, so `next build` fails by design, naming the file to add, until the two pending skins get a
   loader (`export default` of `NameLiveSkin` from `@player.style/<name>-live/react` plus its `skin.css`, registered
   under `<name>-live` in `third-party-previews.tsx`) and an `import x from '@player.style/<name>-live/open/skin.html?open'`
   registered in `open-editions.ts`.
9. **Playwright's Chromium has no H.264/AAC** — papercut, screenshots only. Every hls.js-backed preview (the live
   cards, the audio cards through `MuxAudio`) shows the skin's error dialog, "no level with compatible codecs found in
   manifest", in the screenshot run; the same pages in a stock browser play. The progressive `high.mp4` previews render
   their poster regardless.
