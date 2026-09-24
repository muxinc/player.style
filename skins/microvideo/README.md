# @player.style/microvideo

The [Microvideo](https://player.style/skins/microvideo) skin for [Video.js 10](https://videojs.org): a compact,
centred cluster of controls for short-form video, with the scrubber flush against the bottom edge. Ported from the
[Media Chrome theme of the same name](https://media-chrome.player.style/themes/microvideo).

Ships an HTML custom element and a React component that share one stylesheet.

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

`MicrovideoSkin` accepts the props of the Video.js `Container` (`className`, `style`, …).

## Customize

| Property | Default | Effect |
| --- | --- | --- |
| `--media-accent-color` | `rgb(255 255 255 / 0.9)` | Icons, slider fills, and the dialog button. |
| `--media-secondary-color` | `#000` | The control cluster's surface, drawn at 75% opacity. |
| `--media-font-family` | system UI stack | The preview time and dialog text. |
| `--media-border-radius` | `0` | The player's corners. |
| `--media-object-fit`, `--media-object-position` | `contain`, `center` | How the media and poster fill the player. |
| `--media-seek-backward-button-display`, `--media-seek-forward-button-display` | `none` | Set to `inline-flex` to show the 10-second seek buttons. |
| `--media-pip-button-display` | `none` | Set to `inline-flex` to show the picture-in-picture button. |

```html
<microvideo-skin style="--media-accent-color: #f5c518; --media-pip-button-display: inline-flex">
```

## Peer dependencies

`@videojs/html` for the HTML edition, `@videojs/react` and `react` for the React edition, all optional.

## License

MIT
