# @player.style/notflix

The [Notflix](https://player.style/skins/notflix) skin for [Video.js 10](https://videojs.org): everything but the big
red N and long bus rides to Los Gatos. A full-width time bar with the remaining time, a control bar that scales with
the player, a vertical volume slider, the title in the middle, a subtitles menu, and timeline thumbnails. Ported from
the [Media Chrome theme of the same name](https://media-chrome.player.style/themes/notflix).

Ships an HTML custom element and a React component that share one stylesheet.

## HTML

```html
<script type="module">
  import '@videojs/html/video/player';
  import '@player.style/notflix';
</script>

<video-player content-title="Big Buck Bunny">
  <notflix-skin>
    <video src="https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4"></video>
    <img slot="poster" src="https://image.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/thumbnail.webp" alt="" />
  </notflix-skin>
</video-player>
```

`<notflix-skin>` renders the theme in its shadow root around your media. Two named slots are optional:

- `poster`: an image shown before playback; without it the skin shows the player's poster.
- `title`: markup for the middle of the control bar (`<span slot="title">Episode 1</span>`); without it the skin shows
  the player's content title (`content-title`), if any.

## React

```tsx
import { Video, VideoPlayer } from '@videojs/react/video';
import { NotflixSkin } from '@player.style/notflix/react';
import '@player.style/notflix/skin.css';

export function Player() {
  return (
    <VideoPlayer
      title="Big Buck Bunny"
      poster="https://image.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/thumbnail.webp"
    >
      <NotflixSkin>
        <Video src="https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4" />
      </NotflixSkin>
    </VideoPlayer>
  );
}
```

`NotflixSkin` accepts the props of the Video.js `Container` (`className`, `style`, …) plus `mediaTitle`, a React node
that replaces the content title, as the HTML edition's `title` slot does.

## Features

- Scales with the player: the whole interface steps from 10px to 12, 14 and 16px at 576, 768 and 1440px wide.
- Remaining time at the end of the time bar; click it to show the total duration instead.
- Volume: hover or focus the mute button and a vertical slider rises above it.
- Subtitles: the menu button appears when the media has text tracks and lists them with "Off".
- Thumbnails: a storyboard track (`kind="metadata"`) gives the scrub preview its image.
- Keyboard: `Space`/`k` play, `m` mute, `f` fullscreen, `c` captions, `←`/`→` seek 10s, `↑`/`↓` volume.

## Theming

Set these custom properties on `<notflix-skin>` (or on `NotflixSkin` through `style`/`className`). The colour tokens
colour what they coloured in the Media Chrome theme.

| Token | What it colours | Default |
| --- | --- | --- |
| `--media-accent-color` | The brand red: the progress fill and thumb, the volume fill and thumb. | `#ea3323` |
| `--media-primary-color` | Icons, text (title, remaining time, menu header), the loading spinner, and the error dialog. | `#fff` |
| `--media-font-family` | All text. | `"helvetica neue", "segoe ui", roboto, arial, sans-serif` |
| `--media-border-radius` | The player's corners. | `0` |
| `--media-object-fit`, `--media-object-position` | How the media and poster fill the player. | `contain`, `center` |

`--media-secondary-color` is not read: the original declared it but painted nothing with it (its panels are a fixed
`rgb(38 38 38)`).

```html
<notflix-skin style="--media-accent-color: #f5c518">
```

## Peer dependencies

`@videojs/html` for the HTML edition, `@videojs/react` and `react` for the React edition, all optional.

## License

MIT
