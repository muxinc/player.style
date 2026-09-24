# @player.style/microvideo-live

The [Microvideo](https://player.style/skins/microvideo-live) skin for live video on
[Video.js 10](https://videojs.org), on the live-video preset. The Media Chrome theme switched to a live layout on
`streamtype="live"`: no play, seek or time controls, and a Live badge leading the compact, centred cluster. That layout
is this package. The on-demand package is [`@player.style/microvideo`](https://player.style/skins/microvideo).

Ships an HTML custom element and a React component. Both use `@player.style/microvideo`'s stylesheet and theming
tokens: `skin.css` here is the same file, published under this package's name so it installs on its own.

## HTML

```html
<script type="module">
  import '@videojs/html/live-video/player';
  import '@player.style/microvideo-live/html';
</script>

<live-video-player>
  <microvideo-live-skin>
    <video src="https://stream.mux.com/{PLAYBACK_ID}.m3u8"></video>
  </microvideo-live-skin>
</live-video-player>
```

`<microvideo-live-skin>` renders the theme in its shadow root around your media. The `poster` slot
(`<img slot="poster">`) is optional; without it the skin shows the player's poster.

## React

```tsx
import { LiveVideoPlayer, Video } from '@videojs/react/live-video';
import { MicrovideoLiveSkin } from '@player.style/microvideo-live/react';
import '@player.style/microvideo-live/skin.css';

export function LivePlayer() {
  return (
    <LiveVideoPlayer>
      <MicrovideoLiveSkin>
        <Video src="https://stream.mux.com/{PLAYBACK_ID}.m3u8" />
      </MicrovideoLiveSkin>
    </LiveVideoPlayer>
  );
}
```

`MicrovideoLiveSkin` accepts the props of the Video.js `Container` (`className`, `style`, …) plus the host variants
below.

The badge's dot is grey until playback reaches the live edge, then red; pressing it seeks to the live edge. The
original's DVR layout (`targetlivewindow > 0`, a live badge next to the full on-demand controls) is not ported: Video.js
10 exposes no target live window to a skin.

## Host variants

The theme's two host attributes are attributes on the element and props on the component, as on the on-demand
package.

| Attribute / prop | Values | Effect |
| --- | --- | --- |
| `controlbarplace` / `controlBarPlace` | a CSS `place-self` value (`<align> <justify>` with `start`, `center`, `end`, such as `center center` or `start end`), or `top`, `center`, `bottom` | Where the control cluster sits. Unset is `end center`: bottom centre. |
| `controlbarvertical` / `controlBarVertical` | boolean | Stacks the controls in a 40px column; the volume slider then opens vertically. |

```html
<microvideo-live-skin controlbarplace="center end" controlbarvertical>
```

```tsx
<MicrovideoLiveSkin controlBarPlace="center end" controlBarVertical>
```

The element mirrors them onto its container as `data-controlbar-place` and `data-controlbar-vertical`, which is what
the stylesheet reads; the open files (`dist/open`) set those data attributes directly.

## Theming

The tokens are `@player.style/microvideo`'s; see its README for the full table. Set them on the skin element or
component (or any ancestor). The ones the live-video package paints:

| Token | What it colours | Default |
| --- | --- | --- |
| `--media-accent-color` | The brand colour: icons, the volume fill, the live badge text, the dialog button. Overrides `--media-primary-color`. | `rgb(255 255 255 / 0.9)` |
| `--media-primary-color` | The same surfaces, as the original theme named them. | `rgb(255 255 255 / 0.9)` |
| `--media-secondary-color` | The control cluster and the live badge, drawn at 75% opacity. | `#000` |
| `--media-accent-text-color` | Text on the dialog button. | `#000` |
| `--media-live-button-icon-color` | The live badge's dot behind the live edge. | `rgb(140 140 140)` |
| `--media-live-button-indicator-color` | The live badge's dot at the live edge. | `rgb(255 0 0)` |
| `--media-font-family` | The live badge and dialog text. | system UI stack |
| `--media-border-radius` | The player's corners. | `0` |
| `--media-object-fit`, `--media-object-position` | How the media and poster fill the player. | `contain`, `center` |
| `--media-pip-button-display` | Set to `inline-flex` to show the picture-in-picture button. | `none` |

```html
<microvideo-live-skin style="--media-accent-color: #f5c518; --media-pip-button-display: inline-flex">
```

## Open files

`dist/open/` holds the skin as files to copy into a project: `skin.html`, `skin.css` (the complete stylesheet),
`register.ts`, `Skin.tsx` and a README with the paste instructions for `<live-video-player>` / `LiveVideoPlayer`.

## Peer dependencies

`@videojs/html` for the HTML element, `@videojs/react` and `react` for the React component, all optional.

## License

MIT
