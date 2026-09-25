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
  import '@player.style/yt/html';
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

## Touch screens

On coarse pointers (phones, tablets) every control is at least 44px across, a difference from the original, whose
36px bar below 480px gave 36px targets:

- the bar is 44px tall below 480px, and the progress strip's hit area 44px tall (under the centred seek and play
  buttons, which stay on top on short players);
- settings rows are 44px tall;
- the hover slide-out volume stays closed (iOS ignores volume; the mute button stays);
- picture-in-picture drops out below 400px and the captions button below 350px (Subtitles/CC stays in the settings
  menu), so the rest keep their size.

## Theming

Set these custom properties on `<yt-skin>` (or on `YtSkin` through `style`/`className`).

| Token | What it colours | Default |
| --- | --- | --- |
| `--media-accent-color` | The brand red: the progress fill, its thumb, and the captions-on underline. | `rgb(229 9 20)` (fill), `#f00` (thumb, underline) |
| `--media-primary-color` | Icons, text, the volume slider, the time preview, and menu text. | `#fff` |
| `--media-menu-background` | The settings menu and tooltips. | `rgb(28 28 28 / 0.9)` |
| `--media-font-family` | All text. | `roboto, "helvetica neue", "segoe ui", arial, sans-serif` |
| `--media-border-radius` | The player's corners. | `0` |
| `--media-object-fit`, `--media-object-position` | How the media and poster fill the player. | `contain`, `center` |
| `--media-tooltip-display` | Button tooltips, which the original theme keeps off; set to `flex` to show them. | `none` |

`--media-secondary-color` is not read: the original pinned it to `transparent`, so YT's buttons have no surface to
colour. `--media-accent-color` and `--media-primary-color` behave as in the Media Chrome theme; the menu, font, and
tooltip tokens were fixed values there and are overridable here.

```html
<yt-skin style="--media-accent-color: #f5c518; --media-tooltip-display: flex">
```

## Peer dependencies

`@videojs/html` for the HTML element, `@videojs/react` and `react` for the React component, all optional.

## License

MIT
