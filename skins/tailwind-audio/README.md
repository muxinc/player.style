# @player.style/tailwind-audio

Placeholder for the Video.js 10 port of the [tailwind-audio Media Chrome theme](https://media-chrome.player.style/themes/tailwind-audio)
(`themes/tailwind-audio`). Targets the `audio` preset (`<audio-player>` / `AudioPlayer`). Follow [docs/porting/README.md](../../docs/porting/README.md) and replace
this file with the usage README once the port lands.

## Note for the port

The original is built with Tailwind (`themes/tailwind-audio/{tailwind.config.js,styles.css}`, compiled by
`scripts/build-theme`). This package must ship plain CSS: compile the Tailwind utilities the template uses into a
static `src/skin.css` at author time (run the Tailwind CLI once against the ported template and commit the output,
then rewrite the selectors as `ps-*` classes, or hand-write the equivalent rules) so `build-skin` and this package stay
Tailwind-free. Do not add Tailwind to `package.json`.
