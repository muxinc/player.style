# @player.style/microvideo

The [Microvideo](https://player.style/skins/microvideo) skin for [Video.js 10](https://videojs.org): a compact,
centred cluster of controls for short-form video, with the scrubber flush against the bottom edge. Ported from the
[Media Chrome theme of the same name](https://media-chrome.player.style/themes/microvideo).

Ships an HTML custom element and a React component that share one stylesheet, on the video preset. The skin for live
video is its own package, [`@player.style/microvideo-live`](https://player.style/skins/microvideo-live) (below).

## HTML

```html
<script type="module">
  import '@videojs/html/video/player';
  import '@player.style/microvideo/html';
</script>

<video-player>
  <microvideo-skin>
    <video src="https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4"></video>
    <img slot="poster" src="https://image.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/thumbnail.webp" alt="" />
  </microvideo-skin>
</video-player>
```

`<microvideo-skin>` renders the theme in its shadow root around your media. The `poster` slot is optional; without it
the skin shows the player's poster.

## React

```tsx
import { Video, VideoPlayer } from '@videojs/react/video';
import { MicrovideoSkin } from '@player.style/microvideo/react';
import '@player.style/microvideo/skin.css';

export function Player() {
  return (
    <VideoPlayer poster="https://image.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/thumbnail.webp">
      <MicrovideoSkin>
        <Video src="https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4" />
      </MicrovideoSkin>
    </VideoPlayer>
  );
}
```

`MicrovideoSkin` accepts the props of the Video.js `Container` (`className`, `style`, …) plus the host variants below.

## Live video

The Media Chrome theme switched to a live layout on `streamtype="live"`: no play, seek or time controls, and a Live
badge leading the cluster. That layout ships as its own package on the Video.js live-video preset,
[`@player.style/microvideo-live`](https://www.npmjs.com/package/@player.style/microvideo-live): `<microvideo-live-skin>`
inside `<live-video-player>`, `MicrovideoLiveSkin` inside `LiveVideoPlayer`. It uses this package's stylesheet, tokens
and host variants; `@player.style/microvideo-live/skin.css` is the same file as `@player.style/microvideo/skin.css`.

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

## Host variants

The theme's two host attributes are attributes on the element and props on the component (and on the live-video
package's).

| Attribute / prop | Values | Effect |
| --- | --- | --- |
| `controlbarplace` / `controlBarPlace` | a CSS `place-self` value (`<align> <justify>` with `start`, `center`, `end`, such as `center center` or `start end`), or `top`, `center`, `bottom` | Where the control cluster sits. Unset is `end center`: bottom centre. |
| `controlbarvertical` / `controlBarVertical` | boolean | Stacks the controls in a 40px column; the volume slider then opens vertically. |

```html
<microvideo-skin controlbarplace="center end" controlbarvertical>
```

```tsx
<MicrovideoSkin controlBarPlace="center end" controlBarVertical>
```

The element mirrors them onto its container as `data-controlbar-place` and `data-controlbar-vertical`, which is what
the stylesheet reads; the open files (`dist/open`) set those data attributes directly.

## Theming

Set these on the skin element or component (or any ancestor).

| Token | What it colours | Default |
| --- | --- | --- |
| `--media-accent-color` | The brand colour: icons, slider fills, the live badge text, the dialog button. Overrides `--media-primary-color`. | `rgb(255 255 255 / 0.9)` |
| `--media-primary-color` | The same surfaces, as the original theme named them. | `rgb(255 255 255 / 0.9)` |
| `--media-secondary-color` | The control cluster, the live badge and the preview chip, drawn at 75% opacity. | `#000` |
| `--media-accent-text-color` | Text on the dialog button. | `#000` |
| `--media-live-button-icon-color` | The live badge's dot behind the live edge. | `rgb(140 140 140)` |
| `--media-live-button-indicator-color` | The live badge's dot at the live edge. | `rgb(255 0 0)` |
| `--media-font-family` | The live badge, preview time and dialog text. | system UI stack |
| `--media-border-radius` | The player's corners. | `0` |
| `--media-object-fit`, `--media-object-position` | How the media and poster fill the player. | `contain`, `center` |
| `--media-seek-backward-button-display`, `--media-seek-forward-button-display` | Set to `inline-flex` to show the 10-second seek buttons. | `none` |
| `--media-pip-button-display` | Set to `inline-flex` to show the picture-in-picture button. | `none` |

```html
<microvideo-skin style="--media-accent-color: #f5c518; --media-pip-button-display: inline-flex">
```

Motion: the volume slider and the scrubber's hover state animate for 0.1–0.2s and the buffering spinner turns, as in
the original, which had no `prefers-reduced-motion` rules either.

## Open files

`dist/open/` holds the skin as files to copy into a project: `skin.html`, `skin.css`, `register.ts`, `Skin.tsx` and
a README with the paste instructions. The live-video package's open files sit in its own `dist/open/`.

## Peer dependencies

`@videojs/html` for the HTML element, `@videojs/react` and `react` for the React component, all optional.

## License

MIT
