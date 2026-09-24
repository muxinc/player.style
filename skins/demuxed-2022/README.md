# @player.style/demuxed-2022

The [Demuxed 2022](https://player.style/skins/demuxed-2022) skin for [Video.js 10](https://videojs.org): white round
buttons on a translucent pill bar, a big round play button in the middle, and a soft scrim along the bottom edge. Ported
from the [Media Chrome theme of the same name](https://media-chrome.player.style/themes/demuxed-2022), made by @maveio
for the Demuxed 2022 conference.

Ships an HTML custom element and a React component that share one stylesheet. The skin for live video is its own
package, [`@player.style/demuxed-2022-live`](../demuxed-2022-live), built on the same stylesheet.

## HTML

```html
<script type="module">
  import '@videojs/html/video/player';
  import '@player.style/demuxed-2022/html';
</script>

<video-player>
  <demuxed-2022-skin>
    <video src="https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4"></video>
    <img slot="poster" src="https://image.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/thumbnail.webp" alt="" />
  </demuxed-2022-skin>
</video-player>
```

`<demuxed-2022-skin>` renders the theme in its shadow root around your media. The `poster` slot is optional; without it
the skin shows the player's poster.

## React

```tsx
import { Video, VideoPlayer } from '@videojs/react/video';
import { Demuxed2022Skin } from '@player.style/demuxed-2022/react';
import '@player.style/demuxed-2022/skin.css';

export function Player() {
  return (
    <VideoPlayer poster="https://image.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/thumbnail.webp">
      <Demuxed2022Skin>
        <Video src="https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4" />
      </Demuxed2022Skin>
    </VideoPlayer>
  );
}
```

`Demuxed2022Skin` accepts the props of the Video.js `Container` (`className`, `style`, …).

## Live video

The Media Chrome theme hid its time display and time slider when the stream was live. That layout ships as
`@player.style/demuxed-2022-live` (`<demuxed-2022-live-skin>`, `Demuxed2022LiveSkin`) on the Video.js live-video
preset: a white Live pill takes the time display's place. Its rules live in this package's `skin.css`, keyed on
`data-preset="live-video"`, so both packages ship the same stylesheet.

## Layout

| Player width | Controls |
| --- | --- |
| under 600px | a flat, full-width bar with 48px buttons: mute, time slider, fullscreen; Cast and AirPlay top right; a 72px play button in the middle |
| 600px and up | a pill bar inset 30px with 32px buttons: play, mute (volume slider on hover), time, time slider, captions, picture-in-picture, fullscreen; Cast and AirPlay top right; a 96px play button in the middle |

Captions, picture-in-picture, AirPlay, Cast and volume drop out when the media or browser cannot use them. The controls
fade out while the video plays and the pointer is idle, unless the pointer rests on a control.

## Theming

Set these on the skin element or component (or any ancestor).

| Token | What it colours | Default |
| --- | --- | --- |
| `--media-accent-color` | The brand colour: slider thumbs and the ring around a hovered button. Overrides `--media-tertiary-color`. | `#7596cc` |
| `--media-tertiary-color` | The same surfaces, as the original theme named them. | `#7596cc` |
| `--media-primary-color` | The button glyphs, and the Live pill's text for live video (`--media-icon-color` overrides it). | `#000` |
| `--media-secondary-color` | The round button faces, and the Live pill for live video. | `#fff` |
| `--media-text-color` | The time display and preview time. | `#fff` |
| `--media-range-bar-color` | The played part of the time slider and the volume level. | `#fff` |
| `--media-range-track-background` | The slider tracks. | `rgb(0 0 0 / 0.4)` |
| `--media-range-thumb-background` | The slider thumbs. | the brand colour |
| `--media-live-button-icon-color` | The Live pill's dot behind the live edge (live video). | `rgb(140 140 140)` |
| `--media-live-button-indicator-color` | The Live pill's dot at the live edge (live video). | `rgb(255 0 0)` |
| `--media-font-family` | The time display, preview time and Live pill. | `sofia-pro, sans-serif` |
| `--media-border-radius` | The player's corners. | `0` |
| `--media-object-fit`, `--media-object-position` | How the media and poster fill the player. | `contain`, `center` |

```html
<demuxed-2022-skin style="--media-accent-color: #f5c518">
```

The theme names Sofia Pro but does not load it; include the font on your page to get it, as with the original.

Motion: the controls fade in and out, as in the original, which had no `prefers-reduced-motion` rules either.

## Not ported

The original's `defaultsubtitles`, `defaultduration`, `gesturesdisabled`, `hotkeys` and `nohotkeys`
attributes, which are player options in Video.js 10.

## Open files

`dist/open/` holds the skin as files to copy into a project: `skin.html`, `skin.css`,
`register.ts`, `Skin.tsx` and a README with the paste instructions.

## Peer dependencies

`@videojs/html` for the HTML element, `@videojs/react` and `react` for the React component, all optional.

## License

MIT
