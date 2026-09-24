# @player.style/x-mas-live

The [X-mas](https://player.style/skins/x-mas) skin for live video on [Video.js 10](https://videojs.org), on the
live-video preset: a festive Christmas theme with cozy red and green tones, twinkling lights, and a warm holiday vibe,
by [@qualabs](https://github.com/qualabs). Garlands of fairy lights hang along the top edge, the play button is a
bauble on a wire, and where the on-demand skin has its candy-cane progress bar, a small bauble and "Live" mark the
stream. Ported from the [Media Chrome theme of the same name](https://media-chrome.player.style/themes/x-mas), whose
live rule hid the time range.

Ships an HTML custom element and a React component. The stylesheet is [`@player.style/x-mas`](../x-mas)'s `skin.css`,
shipped again here as `skin.css`; the live-only rules in it key on `data-preset="live-video"`, which only this package
carries. The artwork is the original's inline SVG, SMIL animations included.

## HTML

```html
<script type="module">
  import '@videojs/html/live-video/player';
  import '@player.style/x-mas-live/html';
</script>

<live-video-player>
  <x-mas-live-skin>
    <video src="https://stream.mux.com/{PLAYBACK_ID}.m3u8"></video>
  </x-mas-live-skin>
</live-video-player>
```

`<x-mas-live-skin>` renders the theme in its shadow root around your media. A `poster` slot is available as in the
on-demand skin.

## React

```tsx
import { LiveVideoPlayer, Video } from '@videojs/react/live-video';
import { XMasLiveSkin } from '@player.style/x-mas-live/react';
import '@player.style/x-mas-live/skin.css';

export function LivePlayer() {
  return (
    <LiveVideoPlayer>
      <XMasLiveSkin>
        <Video src="https://stream.mux.com/{PLAYBACK_ID}.m3u8" />
      </XMasLiveSkin>
    </LiveVideoPlayer>
  );
}
```

`XMasLiveSkin` accepts the props of the Video.js `Container` (`className`, `style`, …).

## Layout

The on-demand skin's layout without its time range: the Live button at the start of the bar, then mute (volume slider
on hover from 600px), Cast, AirPlay and fullscreen at the right end, where the hidden time range left them. The bauble
is grey until playback reaches the live edge, then red; pressing the button seeks to the live edge. The arrow keys do
not seek. As in the on-demand skin, clicking the picture does not toggle playback (only the big bauble does).

## Theming

Set these on the skin element or component (or any ancestor).

| Token | What it colours | Default |
| --- | --- | --- |
| `--media-accent-color` | The brand colour: the red stripes of the volume candy cane, and the error dialog's button. | `#e72d33` |
| `--media-range-bar-color` | The whole volume fill; replaces the stripes, accent included. | red and white 45° stripes |
| `--media-range-track-background` | The volume track. | `rgb(255 255 255 / 0.4)` |
| `--media-text-color` | The Live text. | `#fff` |
| `--media-live-button-icon-color` | The Live bauble behind the live edge. | `rgb(140 140 140)` |
| `--media-live-button-indicator-color` | The Live bauble at the live edge. | `rgb(255 0 0)` |
| `--media-border-radius` | The player's corners. | `0` |
| `--media-object-fit`, `--media-object-position` | How the media and poster fill the player. | `contain`, `center` |

```html
<x-mas-live-skin style="--media-accent-color: #19bc8a">
```

Motion: the lights twinkle and the baubles swing (SMIL), and the glyphs grow on hover, as in the original, which had
no `prefers-reduced-motion` rules.

## Open files

`dist/open/` holds the skin as files to copy into a project: `skin.html`, `skin.css`, `register.ts`, `Skin.tsx` and a
README with the paste instructions.

## Peer dependencies

`@videojs/html` for the HTML element, `@videojs/react` and `react` for the React component, all optional.

## License

MIT
