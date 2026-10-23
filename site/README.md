# Video.js Skins site

The Next.js app behind [Video.js Skins](https://skins.videojs.org): a catalog of community and recreated skins for
[Video.js 10](https://videojs.org), with the first-party skins linking to the Video.js docs.

```bash
pnpm install
pnpm -F site dev        # http://localhost:3000
pnpm -F site typecheck
pnpm -F site build
```

Netlify deploys it from the repository root (`netlify.toml`), where `pnpm build` builds the skins and the registry
(`public/r`, gitignored) before the site.

- `app/` – App Router pages and components. Skin previews render the real `@videojs/react` presets.
- `lib/skins.ts` – the skin catalog. First-party skins map to a Video.js preset and tier; community skins come from
  every `skins/<name>/catalog.json` whose skin has a built preset (`pnpm build:skins` first).
- `lib/skin-builds.ts`, `lib/third-party-previews.tsx` – load a community skin's built preset module on demand and
  render its React build, or its HTML build inside the preset's player element.
- `lib/installation-url.ts` – builds the videojs.org installation link for a skin, framework and media choice.
- `lib/site.ts` – the site's URL and name. Metadata, the sitemap, robots and the registry snippets read them.

The Media Chrome-era player.style site is retired; player.style redirects here, and `next.config.ts` sends its old
`/themes/<name>` pages to the skin that recreates each theme.
