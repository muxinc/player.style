# @player.style/instaplay

The [Instaplay](https://player.style/skins/instaplay) skin for [Video.js 10](https://videojs.org): a mobile-first
theme inspired by the playback experiences of popular social media apps. A round play button in the middle while
paused, a mute button in the corner, and a hairline scrubber on the bottom edge; tap the video to pause. Designed for
portrait (9:16) video. Ported from the [Media Chrome theme of the same name](https://media-chrome.player.style/themes/instaplay).

Ships an HTML custom element and a React component that share one stylesheet.

## HTML

```html
<script type="module">
  import '@videojs/html/video/player';
  import '@player.style/instaplay/html';
</script>

<video-player>
  <instaplay-skin>
    <video src="https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4"></video>
    <img slot="poster" src="https://image.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/thumbnail.webp" alt="" />
  </instaplay-skin>
</video-player>
```

`<instaplay-skin>` renders the theme in its shadow root around your media. The `poster` slot is optional; without it
the skin shows the player's poster.

## React

```tsx
import { Video, VideoPlayer } from '@videojs/react/video';
import { InstaplaySkin } from '@player.style/instaplay/react';
import '@player.style/instaplay/skin.css';

export function Player() {
  return (
    <VideoPlayer poster="https://image.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/thumbnail.webp">
      <InstaplaySkin>
        <Video src="https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4" />
      </InstaplaySkin>
    </VideoPlayer>
  );
}
```

`InstaplaySkin` accepts the props of the Video.js `Container` (`className`, `style`, …).

## Size

The player takes the shape of its media, so a portrait video gives a portrait player. To reserve the box before the
media loads, or to fit a fixed frame, give the skin a size; the media then letterboxes inside it:

```html
<instaplay-skin style="aspect-ratio: 9 / 16; max-height: 80vh">
```

## Theming

Set these custom properties on `<instaplay-skin>` (or on `InstaplaySkin` through `style`/`className`). The three colour
tokens colour what they coloured in the Media Chrome theme.

| Token | What it colours | Default |
| --- | --- | --- |
| `--media-accent-color` | The brand colour: the scrubber's progress, drawn at 75% opacity. | `#fff` |
| `--media-primary-color` | The play and mute icons, and the preview time (through `--media-text-color`). | `#fff` |
| `--media-secondary-color` | The round buttons' surface, drawn at 75% opacity (85% of that on hover). | `rgb(38 38 38)` |
| `--media-text-color` | The preview time above the scrubber and the error dialog text. | `--media-primary-color`, else `rgb(238 238 238)` |
| `--media-font-family` | The preview time and dialog text. | `"helvetica neue", "segoe ui", roboto, arial, sans-serif` |
| `--media-border-radius` | The player's corners. | `0` |
| `--media-object-fit`, `--media-object-position` | How the media and poster fill the player. | `contain`, `center` |

```html
<instaplay-skin style="--media-accent-color: #f5c518">
```

## Peer dependencies

`@videojs/html` for the HTML edition, `@videojs/react` and `react` for the React edition, all optional.

## License

MIT
