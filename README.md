# player.style

Video and audio player themes built with [Media Chrome](https://media-chrome.org), for every web player and framework.

Visit [player.style](https://player.style).

# Local Development

This is a pnpm workspace that uses [Vite+](https://viteplus.dev) (`vp`) for task running, linting, and formatting. Use Node.js 22.19 or newer and the pnpm version pinned in `packageManager` (Corepack or `pnpm/action-setup` will pick it up).

1. Clone the repository
1. Run `pnpm install`
1. Run `pnpm dev` to start the site
1. Run `pnpm build` to build the site
1. Run `pnpm lint` to lint and `pnpm format` to format

The themes under `themes/` are archived. Build them with `pnpm build:themes` when publishing.

### Handling Dependency Conflicts with `media-chrome`

If your project already includes `media-chrome` and you encounter dependency conflicts, you can override the resolution to ensure compatibility.

#### Solution: Using `overrides` in `package.json` (for npm 8+)

If you're using **npm** 8 or later, you can enforce a specific version of `media-chrome` in your `package.json` by adding an `overrides` field:

```json
{
  "overrides": {
    "media-chrome": "<your-desired-version>"
  }
}
```

If you’re using **Yarn**, you can enforce a specific version with the resolutions field:

```json
{
  "resolutions": {
    "media-chrome": "<your-desired-version>"
  }
}
```
