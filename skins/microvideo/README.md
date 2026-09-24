# @player.style/microvideo

The [Microvideo](https://player.style/skins/microvideo) skin for [Video.js 10](https://videojs.org): a compact,
centred cluster of controls for short-form video, with the scrubber flush against the bottom edge. Ported from the
[Media Chrome theme of the same name](https://media-chrome.player.style/themes/microvideo).

Ships an HTML custom element and a React component that share one stylesheet, in two editions: the on-demand skin on
the video preset and a live skin on the live-video preset.

## HTML

```html
<script type="module">
  import '@videojs/html/video/player';
  import '@player.style/microvideo';
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

## Live edition

The Media Chrome theme switched to a live layout on `streamtype="live"`: no play, seek or time controls, and a Live
badge leading the cluster. That layout ships as its own element and component on the Video.js live-video preset, from
the same package and stylesheet.

```html
<script type="module">
  import '@videojs/html/live-video/player';
  import '@player.style/microvideo/live';
</script>

<live-video-player>
  <microvideo-live-skin>
    <video src="https://stream.mux.com/{PLAYBACK_ID}.m3u8"></video>
  </microvideo-live-skin>
</live-video-player>
```

```tsx
import { LiveVideoPlayer, Video } from '@videojs/react/live-video';
import { MicrovideoLiveSkin } from '@player.style/microvideo/live/react';
import '@player.style/microvideo/skin.css';

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

The badge's dot is grey until playback reaches the live edge, then red; pressing it seeks to the live edge. The
original's DVR layout (`targetlivewindow > 0`, a live badge next to the full on-demand controls) is not ported: Video.js
10 exposes no target live window to a skin.

## Host variants

The theme's two host attributes are attributes on both elements and props on both components.

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
the stylesheet reads; the open edition (`dist/open`) sets those data attributes directly.

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
| `--media-seek-backward-button-display`, `--media-seek-forward-button-display` | Set to `inline-flex` to show the 10-second seek buttons (on-demand edition). | `none` |
| `--media-pip-button-display` | Set to `inline-flex` to show the picture-in-picture button. | `none` |

```html
<microvideo-skin style="--media-accent-color: #f5c518; --media-pip-button-display: inline-flex">
```

Motion: the volume slider and the scrubber's hover state animate for 0.1–0.2s and the buffering spinner turns, as in
the original, which had no `prefers-reduced-motion` rules either.

## Open edition

`dist/open/` (and `dist/open/live/`) hold each edition as files to copy into a project: `skin.html`, `skin.css`,
`register.ts`, `Skin.tsx` and a README with the paste instructions.

## Peer dependencies

`@videojs/html` for the HTML editions, `@videojs/react` and `react` for the React editions, all optional.

## License

MIT
