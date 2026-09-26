# player.style site

The Next.js app behind [player.style](https://player.style): a gallery of first- and third-party skins for
[Video.js](https://videojs.org).

```bash
pnpm install
pnpm -F site dev        # http://localhost:3000
pnpm -F site typecheck
pnpm -F site build
```

- `app/` – App Router pages and components. Skin previews render the real `@videojs/react` presets.
- `lib/skins.ts` – the skin catalog. First-party skins map to a Video.js preset and tier; third-party listings
  reuse the same shape.
- `lib/installation-url.ts` – builds the videojs.org installation link for a skin, framework and media choice.

The previous Media Chrome theme gallery lives on the `media-chrome` branch and is deployed at
https://media-chrome.player.style.
