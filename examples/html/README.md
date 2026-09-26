# example-html

A Vite vanilla TypeScript page that renders three player.style skins from their packages, written the way a page
would: YT on `<video-player>`, Sutro Audio on `<audio-player>`, Microvideo Live on `<live-video-player>`.

```ts
import '@videojs/html/video/player';
import '@player.style/yt/html';
```

```html
<video-player>
  <yt-skin>
    <video src="…"></video>
    <img slot="poster" src="…" alt="" />
  </yt-skin>
</video-player>
```

It is a packaging smoke test: the skins are `workspace:*` dependencies that resolve through each package's export map
to its built `dist`, so a broken export or `sideEffects` entry fails `pnpm build`. After `vp build`,
`../verify-dist.mjs --elements` checks that each skin's stylesheet and `<name>-skin` definition are in the bundle.

```sh
pnpm build:skins               # from the repository root, first
pnpm -F example-html dev
pnpm -F example-html build     # then `preview` to serve dist/
```
