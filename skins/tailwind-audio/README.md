# @player.style/tailwind-audio

The [Tailwind Audio](https://player.style/skins/tailwind-audio) skin for [Video.js 10](https://videojs.org): a slick,
minimal white audio bar with slate icons, a round play button, and an indigo scrubber. Ported from the
[Media Chrome theme of the same name](https://media-chrome.player.style/themes/tailwind-audio) by @luwes.

Ships an HTML custom element and a React component that share one plain-CSS stylesheet. Both sit on the Video.js
**audio** preset. Tailwind is not needed to use it (see [How the CSS was produced](#how-the-css-was-produced)).

## HTML

```html
<script type="module">
  import '@videojs/html/audio/player';
  import '@player.style/tailwind-audio';
</script>

<audio-player>
  <tailwind-audio-skin>
    <audio src="https://example.com/episode-12.mp3"></audio>
  </tailwind-audio-skin>
</audio-player>
```

`<tailwind-audio-skin>` renders the theme in its shadow root around your `<audio>`, which it never shows. Like the
original, it has no artwork or title slots.

## React

```tsx
import { Audio, AudioPlayer } from '@videojs/react/audio';
import { TailwindAudioSkin } from '@player.style/tailwind-audio/react';
import '@player.style/tailwind-audio/skin.css';

export function Player() {
  return (
    <AudioPlayer>
      <TailwindAudioSkin>
        <Audio src="https://example.com/episode-12.mp3" />
      </TailwindAudioSkin>
    </AudioPlayer>
  );
}
```

`TailwindAudioSkin` accepts the props of the Video.js `Container` (`className`, `style`, …).

## Size and layout

The bar is as wide as its container and follows that width, as the original's `@md` container query (28rem) did. Its
height is fixed by the layout; player.style's own page used the same heights (`h-[88px]`, `@md:h-[64px]`).

| Player width | Layout | Height |
| --- | --- | --- |
| under 448px | An 8px scrubber strip across the top, then mute, back 10, play, forward 10 and rate spread across an 80px bar. | 88px |
| 448px and up | One rounded 64px bar with a hairline border: back 10, play, forward 10, a divider, elapsed time, the scrubber, total time, rate and mute. | 64px |

## Theming

| Token | What it colours | Default |
| --- | --- | --- |
| `--media-accent-color` | The scrubber fill and thumb, the theme's brand indigo. | `rgb(79 70 229)` (indigo-600) |
| `--media-secondary-color` | The bar's background and the ring around the scrubber thumb. | `#fff` (bar), `rgb(255 255 255 / 0.9)` (ring) |
| `--media-font-family` | The times, rate and preview time. | `"helvetica neue", "segoe ui", roboto, arial, sans-serif` |

```html
<tailwind-audio-skin style="--media-accent-color: #f5c518"></tailwind-audio-skin>
```

These are the original's own tokens with its defaults: its Tailwind config routed `accent` and `secondary` through
them. `--media-primary-color` has no effect, as in the original: the config left its `primary` hook commented out, the
play button fixes it to white for its glyph, and the slate icon and text colours are baked-in palette values.

## How the CSS was produced

The Media Chrome edition is written in Tailwind CSS 3 utility classes on its template and compiled with the Tailwind
CLI when the theme is built. This package ships no Tailwind: `src/skin.css` was written by hand, translating each
utility the original template uses into the declarations Tailwind 3.4 generates for it (checked against the original's
compiled stylesheet) under this skin's own `ps-*` classes. The source utility is noted beside each rule, Tailwind's
slate colours are `--ps-slate-*` tokens, and the preflight rules that affected the look (border-box sizing, the root
font and line height) are carried over explicitly. `@md` became `@container ps-tailwind-audio (inline-size >= 448px)`.
The package build copies the file as is; there is no Tailwind step to run.

## Differences from the Media Chrome edition

- The scrubber shows the buffered range from the first frame; in the original the buffered bar is drawn only once
  media-chrome learns it, and it uses a 2% black tint that is barely visible either way.
- The rate button cycles Video.js's rates (`1`, `1.2`, `1.5`, `1.7`, `2`, then `0.2`, `0.5`, `0.7`); media-chrome's
  list stopped at `1`–`2`.
- The elapsed time is not a button (media-chrome's toggled to remaining time on click).
- The `defaultsubtitles`, `defaultduration`, `gesturesdisabled`, `hotkeys` and `nohotkeys` attributes are player
  options in Video.js 10.

## Peer dependencies

`@videojs/html` for the HTML edition, `@videojs/react` and `react` for the React edition, all optional.

## License

MIT
