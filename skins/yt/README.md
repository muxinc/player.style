# @player.style/yt

The [YT](https://player.style/skins/yt) skin for [Video.js 10](https://videojs.org): an homage to the modern,
ubiquitous YouTube player, with a settings menu (playback speed, quality, subtitles), chapter-aware progress bar,
timeline thumbnails, and centred seek controls on narrow viewports. Ported from the
[Media Chrome theme of the same name](https://media-chrome.player.style/themes/yt).

Ships an HTML custom element and a React component that share one stylesheet.

## HTML

```html
<script type="module">
  import '@videojs/html/video/player';
  import '@player.style/yt';
</script>

<video-player>
  <yt-skin>
    <video src="https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4"></video>
    <img slot="poster" src="https://image.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/thumbnail.webp" alt="" />
  </yt-skin>
</video-player>
```

`<yt-skin>` renders the theme in its shadow root around your media. The `poster` slot is optional; without it the skin
shows the player's poster.

## React

```tsx
import { Video, VideoPlayer } from '@videojs/react/video';
import { YtSkin } from '@player.style/yt/react';
import '@player.style/yt/skin.css';

export function Player() {
  return (
    <VideoPlayer poster="https://image.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/thumbnail.webp">
      <YtSkin>
        <Video src="https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4" />
      </YtSkin>
    </VideoPlayer>
  );
}
```

`YtSkin` accepts the props of the Video.js `Container` (`className`, `style`, …).

## Features

- Chapters: add `<track kind="chapters" default>` and the progress bar splits into segments; the chapter title shows
  above the pointer.
- Thumbnails: a storyboard track (`kind="metadata"`) gives the scrub preview its image.
- Settings: playback speed, quality (when the media has more than one rendition), and subtitles (when it has text
  tracks). Entries the media cannot use are hidden.
- Keyboard: `Space`/`k` play, `m` mute, `f` fullscreen, `c` captions, `←`/`→`/`j`/`l` seek 10s, `↑`/`↓` volume.

## Customize

| Property | Default | Effect |
| --- | --- | --- |
| `--media-accent-color` | `rgb(229 9 20)` | The progress fill, its thumb, and the captions-on underline. |
| `--media-primary-color` | `#fff` | Icons, text, the volume slider, and menu text. |
| `--media-menu-background` | `rgb(28 28 28 / 0.9)` | The settings menu and tooltips. |
| `--media-font-family` | Roboto, system UI stack | All text. |
| `--media-border-radius` | `0` | The player's corners. |
| `--media-object-fit`, `--media-object-position` | `contain`, `center` | How the media and poster fill the player. |
| `--media-tooltip-display` | `none` | Set to `flex` to show button tooltips, which the original theme keeps off. |

```html
<yt-skin style="--media-accent-color: #f5c518; --media-tooltip-display: flex">
```

## Peer dependencies

`@videojs/html` for the HTML edition, `@videojs/react` and `react` for the React edition, all optional.

## License

MIT
