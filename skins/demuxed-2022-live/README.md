# @player.style/demuxed-2022-live

The [Demuxed 2022](https://player.style/skins/demuxed-2022) skin for live video on
[Video.js 10](https://videojs.org), on the live-video preset: white round buttons on a translucent pill bar, a big
round play button in the middle, a soft scrim along the bottom edge, and a white Live pill where the on-demand skin
shows the time. Ported from the [Media Chrome theme of the same name](https://media-chrome.player.style/themes/demuxed-2022),
made by @maveio for the Demuxed 2022 conference, whose live rule hid the time display and time slider.

Ships an HTML custom element and a React component. The stylesheet is
[`@player.style/demuxed-2022`](../demuxed-2022)'s `skin.css`, shipped again here as `skin.css`; the live-only rules in
it key on `data-preset="live-video"`, which only this package carries.

## HTML

```html
<script type="module">
  import '@videojs/html/live-video/player';
  import '@player.style/demuxed-2022-live/html';
</script>

<live-video-player>
  <demuxed-2022-live-skin>
    <video src="https://stream.mux.com/{PLAYBACK_ID}.m3u8"></video>
  </demuxed-2022-live-skin>
</live-video-player>
```

`<demuxed-2022-live-skin>` renders the theme in its shadow root around your media. A `poster` slot is available as in
the on-demand skin.

## React

```tsx
import { LiveVideoPlayer, Video } from '@videojs/react/live-video';
import { Demuxed2022LiveSkin } from '@player.style/demuxed-2022-live/react';
import '@player.style/demuxed-2022-live/skin.css';

export function LivePlayer() {
  return (
    <LiveVideoPlayer>
      <Demuxed2022LiveSkin>
        <Video src="https://stream.mux.com/{PLAYBACK_ID}.m3u8" />
      </Demuxed2022LiveSkin>
    </LiveVideoPlayer>
  );
}
```

`Demuxed2022LiveSkin` accepts the props of the Video.js `Container` (`className`, `style`, …).

## Layout

The on-demand skin's layout without its time controls: play, mute (volume slider on hover), the Live pill, then
captions, picture-in-picture and fullscreen at the pill bar's right end, where the hidden time slider left them. Below
600px the bar goes flat with 48px buttons: mute, the Live pill, fullscreen. Cast and AirPlay sit top right, the big
play button in the middle.

The Live pill's dot is grey until playback reaches the live edge, then red; pressing it seeks to the live edge. The
arrow keys do not seek.

## Touch screens

On coarse pointers (phones, tablets) the 32px Live pill reaches 44px tall, drawn as before, and so do the 32px discs
from 600px; the volume pill is left out there, as in [`@player.style/demuxed-2022`](../demuxed-2022/README.md).

## Theming

Set these on the skin element or component (or any ancestor).

| Token | What it colours | Default |
| --- | --- | --- |
| `--media-accent-color` | The brand colour: the volume thumb and the ring around a hovered button or the Live pill. Overrides `--media-tertiary-color`. | `#7596cc` |
| `--media-tertiary-color` | The same surfaces, as the original theme named them. | `#7596cc` |
| `--media-primary-color` | The button glyphs and the Live pill's text (`--media-icon-color` overrides it). | `#000` |
| `--media-secondary-color` | The round button faces and the Live pill. | `#fff` |
| `--media-range-bar-color` | The volume level. | `#fff` |
| `--media-range-track-background` | The volume track. | `rgb(0 0 0 / 0.4)` |
| `--media-range-thumb-background` | The volume thumb. | the brand colour |
| `--media-live-button-icon-color` | The Live pill's dot behind the live edge. | `rgb(140 140 140)` |
| `--media-live-button-indicator-color` | The Live pill's dot at the live edge. | `rgb(255 0 0)` |
| `--media-font-family` | The Live pill's text. | `sofia-pro, sans-serif` |
| `--media-border-radius` | The player's corners. | `0` |
| `--media-object-fit`, `--media-object-position` | How the media and poster fill the player. | `contain`, `center` |

```html
<demuxed-2022-live-skin style="--media-accent-color: #f5c518">
```

Motion: the controls fade in and out, as in the original, which had no `prefers-reduced-motion` rules.

## Open files

`dist/open/` holds the skin as files to copy into a project: `skin.html`, `skin.css`, `register.ts`, `Skin.tsx` and a
README with the paste instructions.

## Peer dependencies

`@videojs/html` for the HTML element, `@videojs/react` and `react` for the React component, all optional.

## License

MIT
