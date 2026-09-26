# @player.style/mux-player-live

The [Mux Player](https://player.style/skins/mux-player-live) skin for live video on [Video.js 10](https://videojs.org),
on the live-video preset. Mux Player's default theme (Gerwig, `@mux/mux-player` 3.13.4) switches to a live layout on
`stream-type="live"`: a Live indicator leads the title bar, and the seek bar, seek buttons, time and playback rate go.
That layout is this package. The on-demand package is [`@player.style/mux-player`](https://player.style/skins/mux-player).

Ships an HTML custom element and a React component. Both use `@player.style/mux-player`'s stylesheet and theming
tokens: `skin.css` here is the same file, published under this package's name so it installs on its own.

## HTML

```html
<script type="module">
  import '@videojs/html/live-video/player';
  import '@player.style/mux-player-live/html';
</script>

<live-video-player content-title="Live from the studio">
  <mux-player-live-skin>
    <video src="https://stream.mux.com/{PLAYBACK_ID}.m3u8"></video>
  </mux-player-live-skin>
</live-video-player>
```

`<mux-player-live-skin>` renders the theme in its shadow root around your media. The `poster` slot
(`<img slot="poster">`) is optional; without it the skin shows the player's poster.

## React

```tsx
import { LiveVideoPlayer, Video } from '@videojs/react/live-video';
import { MuxPlayerLiveSkin } from '@player.style/mux-player-live/react';
import '@player.style/mux-player-live/skin.css';

export function LivePlayer() {
  return (
    <LiveVideoPlayer title="Live from the studio">
      <MuxPlayerLiveSkin>
        <Video src="https://stream.mux.com/{PLAYBACK_ID}.m3u8" />
      </MuxPlayerLiveSkin>
    </LiveVideoPlayer>
  );
}
```

`MuxPlayerLiveSkin` accepts the props of the Video.js `Container` (`className`, `style`, …).

## Features

- Title bar: `• LIVE` in bold capitals, then the title. The dot is grey until playback reaches the live edge, then red;
  pressing the indicator seeks to the live edge.
- Control bar: play, mute and volume, then quality, audio track, captions, AirPlay, cast, picture-in-picture and
  fullscreen, each left out when the media cannot use it.
- Before the first play, the poster and the big play button; below 470px, a plain play button in the middle and the
  Live indicator alone in the title bar, as Mux Player.
- Keyboard: `Space`/`k` play, `m` mute, `f` fullscreen, `c` captions, `↑`/`↓` volume. No seek keys, as Mux Player drops
  them for live streams.

Mux Player's DVR layout (`target-live-window` above zero: the seek bar and seek buttons alongside the Live indicator)
is not recreated: Video.js 10 does not expose a target live window to a skin.

## Theming

The tokens are `@player.style/mux-player`'s; see its README for the full table. The live package adds the Live
indicator's two colours.

| Token | What it colours | Default |
| --- | --- | --- |
| `--media-accent-color` | Button hovers, menu ticks, CC badges and hover outlines. | `#fa50b5` |
| `--media-primary-color` | Icons, the menu backgrounds and the volume thumb; also the title, Live text and volume fill, which are `rgb(238 238 238)` when it is unset. | `#fff` |
| `--media-live-button-icon-color` | The Live dot away from the live edge. | `rgb(140 140 140)` |
| `--media-live-button-indicator-color` | The Live dot at the live edge. | `rgb(255 0 0)` |

```html
<mux-player-live-skin style="--media-live-button-indicator-color: #fa50b5">
```

## Differences from Mux Player

The on-demand package's list applies (tooltip labels, captions position, no Mux badge). Also:

- The Live dot turns red whenever playback is at the live edge; Mux Player also greyed it while paused there.
- On touch screens the controls get 44px targets, the Live indicator included, and a narrow bar drops cast and AirPlay
  first, as the on-demand package describes.
- Gerwig's audio layout is not recreated yet.

## Open files

`dist/open/` holds the skin as files to copy into a project: `skin.html`, `skin.css`, `register.ts`, `Skin.tsx` and a
README with the paste instructions for the live-video preset.

## Peer dependencies

`@videojs/html` for the HTML element, `@videojs/react` and `react` for the React component, all optional.

## Credits

A recreation of the live layout of the default theme of [Mux Player](https://github.com/muxinc/elements)
(`@mux/mux-player` 3.13.4, the Gerwig theme, `media-theme-gerwig`), built on
[Media Chrome](https://github.com/muxinc/media-chrome). The theme's layout, colours and SVG icons, which this skin
inlines, are copyright Mux, Inc. and available under the MIT License.

## License

MIT
