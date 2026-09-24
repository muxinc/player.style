# Round 2 requirements (working plan; delete before merge)

Agreed with Darius on 2026-09-24. Source of truth for the second build round.

## Packaging

- Keep the classic `player.style` package shape: the root package re-exports every skin as
  `player.style/<name>`, `player.style/<name>/react`, and `player.style/<name>/skin.css`, pointing at
  `skins/<name>/dist`. It depends on every `@player.style/<name>`. Root becomes `1.0.0-alpha.0` and is no longer
  private. Each skin also publishes on its own as `@player.style/<name>`.
- Peer dependencies pin `@videojs/html` and `@videojs/react` at exactly `10.0.0-rc.2`; bumps are manual.
- Dist-tags: alphas publish under `next`; `latest` moves when Video.js 10 is GA; `media-chrome` stays on the old
  branch for 0.x fixes.
- Release automation: release-please tracks root plus every `skins/*` package with the node-workspace plugin. CD
  runs `pnpm build:skins`, then `scripts/publish-packages` publishes root and every skin whose version is not on
  npm, with `--tag next --access public --provenance`.
- Delete the legacy tree from main: `themes/`, `scripts/build-theme`, `examples/`. The compare harness loads the
  originals from jsDelivr, so nothing depends on them.

## Skins

- HTML edition stays shadow DOM (packaged). React edition stays a light-DOM component. Both keep one shared
  stylesheet; the parity test stays.
- Open edition: the build emits `dist/open/` per skin: `skin.html` (light-DOM markup, `<slot>` replaced by a
  placeholder comment, named slots unwrapped, like v10's source-owned HTML), `skin.css`, `register.ts` (the
  `@videojs/html/ui/*` imports the markup needs plus icon registration), and `Skin.tsx` (the React source). The site
  shows these with copy buttons. No shadcn registry in this repo yet.
- Theming tokens: every skin honours `--media-primary-color`, `--media-secondary-color`, and `--media-accent-color`
  the way its original did, as its own public API. In addition `--media-accent-color` overrides the theme's main
  brand colour so the site's picker is meaningful. Each README lists the tokens.
- Live variants: microvideo, essentials (was minimal), demuxed-2022, and x-mas branch on stream type in the original.
  Each ships a live edition on the live-video preset from the same package: `@player.style/<name>/live` (HTML) and
  `/live/react`, plus `player.style/<name>/live` re-exports. The gallery lists them as `<Title> Live` cards with
  use case live video, sharing the package.
- Host variants: microvideo's `controlbarplace` and `controlbarvertical` become attributes on the element and props
  on the component.
- Template conditionals (`<template if>`) in microvideo, essentials, notflix, sutro-audio, vimeonova: every branch is
  either ported or listed in the friction log as a scope cut with a reason.
- Rename: the classic `minimal` theme becomes **Essentials** (`skins/essentials`, `@player.style/essentials`,
  `<essentials-skin>`, `EssentialsSkin`, root class `ps-essentials`). The media-chrome edition stays published as
  `@player.style/minimal` under its own tag.
- Reduced motion: match the originals.
- Winamp stays on the video preset.

## Site

- Demo media everywhere is the classic player.style asset: landscape `fXNzVtmtWuyz00xnSrJg4OJH6PyNo6D02UzmgeKGkP5YQ`
  (poster `thumbnail.webp?time=52`, storyboard `storyboard.vtt`, chapters `/landscape-test-chapters.vtt`, title
  "Landscape Promo", byline "by Mux") and portrait `1EFcsL5JET00t00mBv01t00xt00T4QeNQtsXx2cKY6DLd7RM` for instaplay.
  Audio skins use the landscape asset's audio (`/audio.m4a`) with its poster as artwork. Live cards keep a Mux live
  stream. First-party skins switch too.
- First-party skin pages: no framework or media pickers. The Customize section stays. One primary button links to
  the framework-agnostic installation route on videojs.org carrying only `preset` and `skin`.
- Third-party skin pages keep the classic flow: accent colour, media, framework, packaged/open, then snippets.
  - Media options follow the v10 renderer list for the skin's preset: video = Video file, HLS, DASH, Mux, Vimeo,
    YouTube, Cloudflare, Wistia, TikTok, Twitch; audio = Audio file, Mux, Spotify; live video = HLS, Mux.
  - Framework options: HTML, React, Vue, Svelte. Vue and Svelte use the HTML edition with the custom-element config
    snippets v10's docs give. Under HTML, an install-method toggle npm | CDN; CDN ships only if `@player.style/*` from
    jsDelivr coexists with `@videojs/cdn` in a real test, otherwise it is left out and logged.
  - Packaged shows install command plus usage; Open shows the `dist/open` files with copy buttons.
  - Snippets include the accent (and only the accent) as an inline style when set.
- Filter semantics unchanged. Gallery order unchanged, live cards next to their base skin.

## Docs and hand-off

- Update `docs/porting/README.md`, `best-practices.md`, and the per-skin friction logs for token support, live
  editions, host variants, and the open build. Keep `friction-log.md` as the rollup.
- After the build: refreshed bundle, then the friction logs go to #videojs-feedback in Slack (Darius will say when).
