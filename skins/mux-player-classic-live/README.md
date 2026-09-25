# @player.style/mux-player-classic-live

The [Mux Player Classic](https://player.style/skins/mux-player-classic-live) skin for live video on
[Video.js 10](https://videojs.org), on the live-video preset. Mux Player's classic theme switched to a live layout for
`stream-type="live"`: a Live badge in the top-left corner, play alone in the middle of the picture, and a control bar
with no time range, seek, time or rate controls. That layout is this package. The on-demand package is
[`@player.style/mux-player-classic`](https://player.style/skins/mux-player-classic).

Ships an HTML custom element and a React component. Both use `@player.style/mux-player-classic`'s stylesheet and
theming tokens: `skin.css` here is the same file, published under this package's name so it installs on its own.

## HTML

```html
<script type="module">
  import '@videojs/html/live-video/player';
  import '@player.style/mux-player-classic-live/html';
</script>

<live-video-player>
  <mux-player-classic-live-skin>
    <video src="https://stream.mux.com/{PLAYBACK_ID}.m3u8"></video>
  </mux-player-classic-live-skin>
</live-video-player>
```

`<mux-player-classic-live-skin>` renders the theme in its shadow root around your media. The `poster` slot
(`<img slot="poster">`) is optional; without it the skin shows the player's poster. Set `content-title` on
`<live-video-player>` to show the title after the badge.

## React

```tsx
import { LiveVideoPlayer, Video } from '@videojs/react/live-video';
import { MuxPlayerClassicLiveSkin } from '@player.style/mux-player-classic-live/react';
import '@player.style/mux-player-classic-live/skin.css';

export function LivePlayer() {
  return (
    <LiveVideoPlayer>
      <MuxPlayerClassicLiveSkin>
        <Video src="https://stream.mux.com/{PLAYBACK_ID}.m3u8" />
      </MuxPlayerClassicLiveSkin>
    </LiveVideoPlayer>
  );
}
```

`MuxPlayerClassicLiveSkin` accepts the props of the Video.js `Container` (`className`, `style`, …).

## Features

- The `LIVE` badge leads the top bar at every width, its dot grey behind the live edge (or while paused) and red at it;
  pressing it seeks to the live edge. From 300px the title follows it.
- From 300px: play in the centre; the bar holds play, mute and volume, then quality, audio, captions, AirPlay, cast,
  picture-in-picture and fullscreen, each shown only when the media can use it. Under 300px: play, mute, captions and
  fullscreen.
- The on-demand skin's loading arc, menus, auto-hide and hotkeys, less the seek keys.

## Theming

The tokens are `@player.style/mux-player-classic`'s; see its README for the full table. The Live badge adds two:

| Token | What it colours | Default |
| --- | --- | --- |
| `--media-live-button-icon-color` | The badge's dot behind the live edge or while paused. | `rgb(140 140 140)` |
| `--media-live-button-indicator-color` | The badge's dot at the live edge while playing. | `rgb(255 0 0)` |
| `--media-primary-color` | Icons and text, the badge's `LIVE` included. | Icons `#fff`, text `rgb(238 238 238)` |
| `--media-secondary-color` | The control bar and menus. | `rgb(0 0 0 / 0.75)` |
| `--media-accent-color` | The volume level and thumb. | `--media-primary-color`, else `#fff` |

## Differences from Mux Player's classic theme

- The theme's DVR layout (`target-live-window` above 0: the badge in the bar beside a time range and seek buttons) is
  not ported: Video.js 10 exposes no target live window to a skin, so only the plain live layout is.
- The on-demand package's differences apply too: see its README.

## Open files

`dist/open/` holds the skin as files to copy into a project: `skin.html`, `skin.css`, `register.ts`, `Skin.tsx` and a
README with the paste instructions.

## Peer dependencies

`@videojs/html` for the HTML element, `@videojs/react` and `react` for the React component, all optional.

## Credits

A recreation of the live layout of the `classic` theme of
[Mux Player](https://github.com/muxinc/elements/tree/main/packages/mux-player) as published in `@mux/mux-player`
3.13.4, with media-chrome's Live button. Its template and icons are copyright Mux, Inc. and available under the MIT
License.

## License

MIT
