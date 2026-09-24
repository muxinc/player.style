# @player.style/demuxed-2022

The [Demuxed 2022](https://player.style/skins/demuxed-2022) skin for [Video.js 10](https://videojs.org): white round
buttons on a translucent pill bar, a big round play button in the middle, and a soft scrim along the bottom edge. Ported
from the [Media Chrome theme of the same name](https://media-chrome.player.style/themes/demuxed-2022), made by @maveio
for the Demuxed 2022 conference.

Ships an HTML custom element and a React component that share one stylesheet.

## HTML

```html
<script type="module">
  import '@videojs/html/video/player';
  import '@player.style/demuxed-2022';
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

## Layout

| Player width | Controls |
| --- | --- |
| under 600px | a flat, full-width bar with 48px buttons: mute, time slider, fullscreen; Cast and AirPlay top right; a 72px play button in the middle |
| 600px and up | a pill bar inset 30px with 32px buttons: play, mute (volume slider on hover), time, time slider, captions, picture-in-picture, fullscreen; Cast and AirPlay top right; a 96px play button in the middle |

Captions, picture-in-picture, AirPlay, Cast and volume drop out when the media or browser cannot use them. The controls
fade out while the video plays and the pointer is idle, unless the pointer rests on a control.

## Customize

| Property | Default | Effect |
| --- | --- | --- |
| `--media-accent-color` | `#7596cc` | Slider thumbs and the ring around a hovered button (falls back to `--media-tertiary-color`). |
| `--media-primary-color` | `#000` | The button glyphs (`--media-icon-color` overrides it). |
| `--media-secondary-color` | `#fff` | The round button faces. |
| `--media-text-color` | `#fff` | The time display and preview time. |
| `--media-font-family` | `sofia-pro, sans-serif` | The time display and preview time. |
| `--media-border-radius` | `0` | The player's corners. |
| `--media-object-fit`, `--media-object-position` | `contain`, `center` | How the media and poster fill the player. |

```html
<demuxed-2022-skin style="--media-accent-color: #f5c518">
```

The theme names Sofia Pro but does not load it; include the font on your page to get it, as with the original.

## Not ported

The original's live treatment (time display and slider hidden while `mediastreamtype="live"`; Video.js 10 has a
separate live preset) and its `defaultsubtitles`, `defaultduration`, `gesturesdisabled`, `hotkeys` and `nohotkeys`
attributes, which are player options in Video.js 10.

## Peer dependencies

`@videojs/html` for the HTML edition, `@videojs/react` and `react` for the React edition, all optional.

## License

MIT
