# Video.js Skins site

The Next.js app behind [Video.js Skins](https://skins.videojs.org): a catalog of community and recreated skins for
[Video.js 10](https://videojs.org), with the first-party skins linking to the Video.js docs.

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
- `lib/site.ts` – the site's URL and name. Metadata, the sitemap, robots and the registry snippets read them.

The Media Chrome-era player.style site is retired; player.style redirects here, and `next.config.ts` sends its old
`/themes/<name>` pages to the skin that recreates each theme.
