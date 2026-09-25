# @player.style/vidstack-live

The [Vidstack](https://player.style/skins/vidstack) skin for live video on [Video.js 10](https://videojs.org), on the
Video.js live-video preset. It recreates the live mode of the [Vidstack](https://vidstack.io) player's default video
layout (`<media-player stream-type="live">`, `vidstack` 1.15.6): the LIVE badge where the time was, grey behind the
live edge and red at it. Clicking it seeks to the live edge. Everything else is the on-demand skin: the gradient, the
round tooltip-labelled buttons, the sliding volume, the settings menu and the small-screen layout.

Ships an HTML custom element and a React component. The stylesheet is
[`@player.style/vidstack`](https://www.npmjs.com/package/@player.style/vidstack)'s, built into this package, so each
package installs on its own.

## HTML

```html
<script type="module">
  import '@videojs/html/live-video/player';
  import '@player.style/vidstack-live/html';
</script>

<live-video-player>
  <vidstack-live-skin>
    <video src="https://stream.mux.com/{PLAYBACK_ID}.m3u8"></video>
  </vidstack-live-skin>
</live-video-player>
```

`<vidstack-live-skin>` renders the skin in its shadow root around your media. An optional `poster` slot takes an
`<img slot="poster">`; without it the skin shows the player's poster.

## React

```tsx
import { LiveVideoPlayer, Video } from '@videojs/react/live-video';
import { VidstackLiveSkin } from '@player.style/vidstack-live/react';
import '@player.style/vidstack-live/skin.css';

export function Player() {
  return (
    <LiveVideoPlayer>
      <VidstackLiveSkin>
        <Video src="https://stream.mux.com/{PLAYBACK_ID}.m3u8" />
      </VidstackLiveSkin>
    </LiveVideoPlayer>
  );
}
```

`VidstackLiveSkin` accepts the props of the Video.js `Container` (`className`, `style`, …).

## Features

- Large layout: play, mute with its sliding volume slider, the LIVE badge 12px after it, the title, captions,
  settings, AirPlay, Google Cast, picture-in-picture and fullscreen, in one row along the bottom.
- Small layout: casting, captions, settings and volume along the top, the round play button in the middle, and LIVE
  with fullscreen in the row Vidstack keeps above its slider.
- The badge is Vidstack's `.vds-live-button-text`: 12px semibold type with 1.5px tracking in a 2px-rounded chip,
  `#161616` on `#8a8a8a` behind the live edge, `#f5f5f5` on `#dc2626` at it.
- No time slider, times or seek shortcuts. Keyboard: `k`/`Space` play, `m` mute, `f` fullscreen, `i`
  picture-in-picture, `c` captions, `ArrowUp`/`ArrowDown` volume.

## Theming

Everything in [`@player.style/vidstack`'s Theming table](https://www.npmjs.com/package/@player.style/vidstack)
applies here, plus the live button's two colours:

| Token | What it colours | Default |
| --- | --- | --- |
| `--media-live-button-icon-color` | The badge behind the live edge (Vidstack's `--media-live-button-bg`). | `#8a8a8a` |
| `--media-live-button-indicator-color` | The badge at the live edge (Vidstack's `--media-live-button-edge-bg`). | `#dc2626` |

```html
<vidstack-live-skin style="--media-live-button-indicator-color: #e5091a">
```

## Differences from Vidstack

- Vidstack keeps its time slider in live mode, filled red to the live edge; the live-video preset has no time slider,
  so the small layout's bottom row keeps the room the slider took.
- Settings has no Speed item: the live-video preset does not offer playback rates. Quality and Captions show as on the
  on-demand skin; Vidstack's Accessibility and Audio submenus are not there (see the on-demand README).
- Vidstack showed the duration chip before the first play even for a live stream; this skin does not.
- The other differences of [`@player.style/vidstack`](https://www.npmjs.com/package/@player.style/vidstack) apply.

## Open files

`dist/open/` holds the skin as files to copy into a project: `skin.html`, `skin.css`, `register.ts`, `Skin.tsx` and a
README with the paste instructions.

## Peer dependencies

`@videojs/html` for the HTML element, `@videojs/react` and `react` for the React component, all optional.

## Credits

A recreation of the live mode of the default video layout of [Vidstack Player](https://github.com/vidstack/player)
1.15.6 (npm `vidstack`), by Rahim Alwer and the Vidstack contributors, available under the MIT License, with the
[media-icons](https://github.com/vidstack/media-icons) SVG paths (MIT).

## License

MIT
