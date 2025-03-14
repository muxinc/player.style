# player.style

Video and audio player themes built with [Media Chrome](https://media-chrome.org), for every web player and framework.

Visit [player.style](https://player.style).

# Local Development

This is a monorepo that uses NPM workspaces and Turbo. The root package is also a published package, which currently prevents having identically named NPM scripts in both the root and workspace packages.

For this reason we use the `turbo` CLI directly in the root directory.

1. Install Turbo globally: `npm install -g turbo`
1. Clone the repository
1. Run `npm install`
1. Run `turbo build`

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
