# @player.style/sutro-audio

The [Sutro Audio](https://player.style/skins/sutro-audio) skin for [Video.js 10](https://videojs.org): a rounded,
deep-blue audio card with softly lit edges, artwork, title and byline, rate / seek / play / mute buttons, and the
elapsed and total time. Ported from the
[Media Chrome theme of the same name](https://media-chrome.player.style/themes/sutro-audio) by Mux.

Ships an HTML custom element and a React component that share one stylesheet. Both sit on the Video.js **audio**
preset.

## HTML

```html
<script type="module">
  import '@videojs/html/audio/player';
  import '@player.style/sutro-audio';
</script>

<audio-player content-title="Episode 12: Antenna">
  <sutro-audio-skin>
    <audio src="https://example.com/episode-12.mp3"></audio>
    <img slot="poster" src="https://example.com/artwork.jpg" alt="" />
    <span slot="byline">The Sutro Show</span>
  </sutro-audio-skin>
</audio-player>
```

`<sutro-audio-skin>` renders the theme in its shadow root around your `<audio>`, which it never shows. The `poster`
slot holds the artwork (without it the skin shows the player's poster, if any); the title comes from the player's
`content-title` attribute; the `byline` slot takes any inline content. Title and byline are hidden when empty.

## React

```tsx
import { Audio, AudioPlayer } from '@videojs/react/audio';
import { SutroAudioSkin } from '@player.style/sutro-audio/react';
import '@player.style/sutro-audio/skin.css';

export function Player() {
  return (
    <AudioPlayer title="Episode 12: Antenna" poster="https://example.com/artwork.jpg">
      <SutroAudioSkin byline="The Sutro Show">
        <Audio src="https://example.com/episode-12.mp3" />
      </SutroAudioSkin>
    </AudioPlayer>
  );
}
```

`SutroAudioSkin` accepts the props of the Video.js `Container` (`className`, `style`, …) plus `byline`.

## Size and layout

The card is as wide as its container and follows that width, as the original's `md:480` breakpoint did:

| Player width | Layout |
| --- | --- |
| under 480px | A stacked card: square artwork with the title over its bottom edge, the buttons, then elapsed time, a small scrubber and the total time. Its height follows the width (446px tall at 360px wide). |
| 480px and up | One row: artwork (52px) and text, the buttons in the middle, the times on the right; the scrubber runs along the bottom edge. At least 84px tall. |

Give the element (or its container) a height and the card fills it; player.style's own page used 98px from 480px up.

## Customize

| Property | Default | Effect |
| --- | --- | --- |
| `--media-accent-color` | none | Recolours the icons, text, title, and both scrubbers (falls back to `--media-primary-color`). |
| `--media-primary-color` | `#fff` | Icons and the title; the times, rate and wide scrubber use it too (default `#eee`). |
| `--media-text-color` | `#eee` | The times, rate, and preview time. |
| `--media-secondary-color` | `#17507b` | The card's background. |
| `--media-font-family` | Roboto, Helvetica Neue, Segoe UI, Arial | Buttons, times, title and byline. |
| `--media-border-radius` | `16px` | The card's corners. |
| `--media-object-position` | `center` | Where the artwork is cropped. |

```html
<sutro-audio-skin style="--media-accent-color: #f5c518; --media-secondary-color: #222">
```

## Differences from the Media Chrome edition

- The artwork fills its square (`object-fit: cover`, centred). The original drew the image at its natural pixel size
  and showed its top-left corner.
- The wide scrubber along the bottom edge responds to the pointer and shows the preview time. In the original the
  controls row covered it, so it could not be hovered or clicked.
- The rate button cycles Video.js's rates (`1`, `1.2`, `1.5`, `1.7`, `2`, then `0.2`, `0.5`, `0.7`); media-chrome's
  list stopped at `1`–`2`.
- The `defaultsubtitles`, `defaultduration`, `gesturesdisabled`, `hotkeys` and `nohotkeys` attributes are player
  options in Video.js 10.

## Peer dependencies

`@videojs/html` for the HTML edition, `@videojs/react` and `react` for the React edition, all optional.

## License

MIT
