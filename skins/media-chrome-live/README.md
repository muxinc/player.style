# @player.style/media-chrome-live

The [Media Chrome](https://player.style/skins/media-chrome) skin for live video on [Video.js 10](https://videojs.org),
on the live-video preset: Media Chrome's default component look with its live control bar. Where the on-demand skin
has seek buttons, the time range, the time display and the playback rate, this one has `media-live-button`: a dot that
turns red at the live edge, and LIVE. The on-demand package is
[`@player.style/media-chrome`](https://player.style/skins/media-chrome).

Ships an HTML custom element and a React component. Both use `@player.style/media-chrome`'s stylesheet and theming
tokens: `skin.css` here is the same file, published under this package's name so it installs on its own. The live-only
rules in it key on `data-preset="live-video"`, which only this package sets.

## HTML

```html
<script type="module">
  import '@videojs/html/live-video/player';
  import '@player.style/media-chrome-live/html';
</script>

<live-video-player>
  <media-chrome-live-skin>
    <video src="https://stream.mux.com/{PLAYBACK_ID}.m3u8"></video>
  </media-chrome-live-skin>
</live-video-player>
```

`<media-chrome-live-skin>` renders the skin in its shadow root around your media. The `poster` slot
(`<img slot="poster">`) is optional; without it the skin shows the player's poster.

## React

```tsx
import { LiveVideoPlayer, Video } from '@videojs/react/live-video';
import { MediaChromeLiveSkin } from '@player.style/media-chrome-live/react';
import '@player.style/media-chrome-live/skin.css';

export function LivePlayer() {
  return (
    <LiveVideoPlayer>
      <MediaChromeLiveSkin>
        <Video src="https://stream.mux.com/{PLAYBACK_ID}.m3u8" />
      </MediaChromeLiveSkin>
    </LiveVideoPlayer>
  );
}
```

`MediaChromeLiveSkin` accepts the props of the Video.js `Container` (`className`, `style`, …).

## Features

- The control bar: play, LIVE, mute, volume range, captions (only when the media has text tracks),
  picture-in-picture (where supported) and fullscreen, each on Media Chrome's translucent control background. As in
  Media Chrome, the bar stays transparent past the last control.
- The LIVE button: a 12px dot, a space and LIVE in the bold button type, with no tooltip. The dot is grey
  (`rgb(140 140 140)`) until playback is at the live edge and playing, then red; pressing it seeks to the live edge.
- Everything else as the on-demand skin: the poster before the first play, tooltips with Media Chrome's words, the
  loading indicator, the controls fading after two idle seconds while playing, and media-controller's hotkeys without
  the seek keys.

## Theming

Every token of `@player.style/media-chrome` applies (see its README), plus the two of `media-live-button`:

| Token | What it colours | Default |
| --- | --- | --- |
| `--media-live-button-icon-color` | The dot behind the live edge or while paused. | `rgb(140 140 140)` |
| `--media-live-button-indicator-color` | The dot while playing at the live edge. | `rgb(255 0 0)` |
| `--media-live-button-display` | Show or hide the LIVE button. | `inline-flex` |

## Differences from Media Chrome

- Media Chrome's DVR layout (a live button next to the full on-demand controls, for a stream with a seekable window)
  is not ported: Video.js 10 exposes no target live window to a skin.
- The differences listed for `@player.style/media-chrome` apply to the controls the two share.

## Open files

`dist/open/` holds the skin as files to copy into a project: `skin.html`, `skin.css`, `register.ts`, `Skin.tsx` and a
README with the paste instructions.

## Peer dependencies

`@videojs/html` for the HTML element, `@videojs/react` and `react` for the React component, all optional.

## Credits

A recreation of the default component styles of [Media Chrome](https://github.com/muxinc/media-chrome) 4.19.2 by
Mux, whose icon SVG paths this skin inlines. Media Chrome is available under the MIT License.

## License

MIT
