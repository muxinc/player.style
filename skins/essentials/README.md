# @player.style/essentials

The [Essentials](https://player.style/skins/essentials) skin for [Video.js 10](https://videojs.org): the bare-bones controls
viewers need in one rounded bar inset from the bottom edge. Ported from the classic player.style
[Minimal theme](https://media-chrome.player.style/themes/minimal) by Mux, renamed so it does not collide with the
Video.js 10 Minimal skins; the Media Chrome edition stays published as `@player.style/minimal`.

Ships an HTML custom element and a React component that share one stylesheet.

## HTML

```html
<script type="module">
  import '@videojs/html/video/player';
  import '@player.style/essentials';
</script>

<video-player content-title="Big Buck Bunny">
  <essentials-skin>
    <video src="https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4"></video>
    <img slot="poster" src="https://image.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/thumbnail.webp" alt="" />
  </essentials-skin>
</video-player>
```

`<essentials-skin>` renders the theme in its shadow root around your media. The `poster` slot is optional; without it the
skin shows the player's poster. The title in the top-left corner comes from the player's `content-title` attribute and
is hidden when there is none.

## React

```tsx
import { Video, VideoPlayer } from '@videojs/react/video';
import { EssentialsSkin } from '@player.style/essentials/react';
import '@player.style/essentials/skin.css';

export function Player() {
  return (
    <VideoPlayer
      title="Big Buck Bunny"
      poster="https://image.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/thumbnail.webp"
    >
      <EssentialsSkin>
        <Video src="https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4" />
      </EssentialsSkin>
    </VideoPlayer>
  );
}
```

`EssentialsSkin` accepts the props of the Video.js `Container` (`className`, `style`, …).

## Responsive controls

The bar follows the player's width, as the original's breakpoints did:

| Player width | Controls |
| --- | --- |
| under 384px | play, time slider, mute, captions, fullscreen; a 30px bar |
| 384px and up | adds volume, AirPlay and Cast (and the opt-in seek and picture-in-picture buttons); a 38px bar |
| 576px and up | adds the elapsed time; a 46px bar |

Captions, AirPlay, Cast and volume drop out when the media or browser cannot use them.

## Live edition

The original switched to a live layout on `streamtype="live"`: no play, seek or time-slider controls, a Live badge
and the elapsed time on the left of the bar. That layout ships as its own package on the Video.js live-video preset,
[`@player.style/essentials-live`](../essentials-live/README.md) (`<essentials-live-skin>`, `EssentialsLiveSkin`),
which uses this skin's stylesheet.

## Theming

Set these on the skin element or component (or any ancestor). The first three are the original theme's own tokens;
the rest are the Media Chrome element tokens it set, overridable the same way.

| Token | What it colours | Default |
| --- | --- | --- |
| `--media-accent-color` | The brand colour: icons, slider fills, the dialog button, and (through `--media-text-color`'s fallback) the text. Overrides `--media-primary-color`. | `#fff` |
| `--media-primary-color` | The same surfaces, as the original theme named them. | `#fff` |
| `--media-secondary-color` | The bar's surface, drawn at 75% opacity. | `#000` |
| `--media-text-color` | The elapsed time, preview time and title. | `#eee` |
| `--media-icon-color` | The button glyphs and spinner alone. | the brand colour |
| `--media-range-bar-color` | The slider fills alone. | the brand colour |
| `--media-range-track-background` | The slider tracks. | `rgb(255 255 255 / 0.5)` |
| `--media-time-range-buffered-color` | The buffered part of the time slider. | `rgb(255 255 255 / 0.4)` |
| `--media-preview-thumbnail-border-radius` | The storyboard thumbnail's corners. | `2px` |
| `--media-accent-text-color` | Text on the dialog button. | `#000` |
| `--media-font-family` | All text. | system UI stack |
| `--media-border-radius` | The player's corners. | `0` |
| `--media-object-fit`, `--media-object-position` | How the media and poster fill the player. | `contain`, `center` |
| `--media-seek-backward-button-display`, `--media-seek-forward-button-display` | Set to `inline-flex` to show the 10-second seek buttons (384px and up). | `none` |
| `--media-pip-button-display` | Set to `inline-flex` to show the picture-in-picture button (384px and up). | `none` |

```html
<essentials-skin style="--media-accent-color: #f5c518; --media-pip-button-display: inline-flex">
```

Motion: the bar fades over 0.25s / 1s, the preview time over 0.25–0.5s, and the buffering spinner turns, as in the
original, which had no `prefers-reduced-motion` rules either.

## Not ported

The original's DVR layout (`targetlivewindow > 0`: the Live badge next to the full seek controls and time range);
Video.js 10 exposes no target live window to a skin. The `defaultsubtitles`, `defaultduration`, `gesturesdisabled`,
`hotkeys`, `nohotkeys`, `backwardseekoffset` and `forwardseekoffset` attributes are player options (or fixed at the
original's 10s default) in Video.js 10.

## Open edition

`dist/open/` holds the skin as files to copy into a project: `skin.html`, `skin.css`, `register.ts`, `Skin.tsx` and a
README with the paste instructions.

## Peer dependencies

`@videojs/html` for the HTML edition, `@videojs/react` and `react` for the React edition, all optional.

## License

MIT
