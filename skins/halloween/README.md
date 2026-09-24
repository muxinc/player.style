# @player.style/halloween

The [Halloween](https://player.style/skins/halloween) skin for [Video.js 10](https://videojs.org), by
[@muxinc](https://github.com/muxinc): bring the spooky season to your video player. A jack-o'-lantern play button whose
carved face lights up while the video plays, a cobweb timeline with a spider that walks along it, and a candle for a
volume control whose flame glows brighter with the level. Ported from the
[Media Chrome theme of the same name](https://media-chrome.player.style/themes/halloween).

Ships an HTML custom element and a React component that share one stylesheet. The cobweb and spider artwork (four
small SVGs) is inlined in that stylesheet as data URIs, so `skin.css` is the only file to import.

## HTML

```html
<script type="module">
  import '@videojs/html/video/player';
  import '@player.style/halloween';
</script>

<video-player>
  <halloween-skin>
    <video src="https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4"></video>
    <img slot="poster" src="https://image.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/thumbnail.webp" alt="" />
  </halloween-skin>
</video-player>
```

`<halloween-skin>` renders the theme in its shadow root around your media. The `poster` slot is optional; without it
the skin shows the player's poster.

## React

```tsx
import { Video, VideoPlayer } from '@videojs/react/video';
import { HalloweenSkin } from '@player.style/halloween/react';
import '@player.style/halloween/skin.css';

export function Player() {
  return (
    <VideoPlayer poster="https://image.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/thumbnail.webp">
      <HalloweenSkin>
        <Video src="https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4" />
      </HalloweenSkin>
    </VideoPlayer>
  );
}
```

`HalloweenSkin` accepts the props of the Video.js `Container` (`className`, `style`, …).

## Layout

The player is 16:9. The pumpkin sits in the middle (70px, 85px from a 384px-wide player) and grows threefold while
pressed; the cobweb spans the bottom edge with the candle at its right. Both fade out after a few idle seconds of
playback, unless the pointer rests on the pumpkin or the bar, and come back on pointer movement or when paused. There
is no mute, fullscreen, or time display, as in the original; the keyboard shortcuts (Space/K, M, F, C, arrows) still
work.

The spider walks and the flame flickers through CSS animations, as in the original; neither checks
`prefers-reduced-motion`, which the original did not either.

## Theming

| Token | What it colours | Default |
| --- | --- | --- |
| `--media-accent-color` | The pumpkin (the theme's brand orange) and the spun, played part of the cobweb. | `#ff8000` (pumpkin), `#fff` (web) |
| `--media-primary-color` | The pumpkin's carved face while paused; also the preview time. | `#000` (face), `rgb(238 238 238)` (preview time) |
| `--media-text-color` | The preview time alone (ahead of `--media-primary-color`). | `rgb(238 238 238)` |
| `--media-secondary-color` | Nothing: the original read it into a preview background it then made transparent. | none |
| `--media-font-family` | The preview time. | `"helvetica neue", "segoe ui", roboto, arial, sans-serif` |
| `--media-border-radius` | The player's corners. | `0` |
| `--media-object-fit`, `--media-object-position` | How the media and poster fill the player. | `contain`, `center` |

```html
<halloween-skin style="--media-accent-color: #8a2be2">
```

The original declared `--media-accent-color` (default `#fff`) but never used it; the port lets it drive the pumpkin, so
one colour re-themes the skin, and the web, whose white matches that `#fff` default. The stem, the lit face
(`#ffe194`), the candle, the flame and its glow stay the theme's own artwork.

## Peer dependencies

`@videojs/html` for the HTML edition, `@videojs/react` and `react` for the React edition, all optional.

## License

MIT
