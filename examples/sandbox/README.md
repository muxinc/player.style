# example-sandbox

A small Vite + React app for trying any player.style skin as a user would install it. The strip at the top picks:

- **Skin**: every `@player.style/*` package, on its preset's player (video, audio or live video).
- **Framework**: the React component (`@player.style/<name>/react` plus `skin.css`), or the HTML element
  (`@player.style/<name>/html`, the `<name>-skin` element) rendered as custom elements inside React.
- **Source**: the demo MP4 on the browser's own media element, its HLS stream on Mux media, or the Mux live stream.
- **Accent**: `--media-accent-color` on the skin.

The choice lives in the query string (`?skin=yt&framework=html&source=hls&accent=f5c518`), so any combination is a
link.

`src/skins.ts` lists the packages with a literal `import()` for each one's `./react`, `./html` and `./skin.css`, so
every package is resolved through its export map at build time and each loads only when picked. After `vp build`,
`../verify-dist.mjs --elements` checks that every skin's stylesheet and element definition made it into the bundle.
Add a new skin package to `dependencies` and to that list.

```sh
pnpm build:skins                 # from the repository root, first
pnpm -F example-sandbox dev
pnpm -F example-sandbox build    # then `preview` to serve dist/
```

`vercel.json` deploys it from this directory: it installs from the repository root, builds the skins, then this app
into `dist`.
