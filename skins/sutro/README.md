# @player.style/sutro

The [Sutro](https://player.style/skins/sutro) skin for [Video.js 10](https://videojs.org): Mux's sleek, modern theme,
lovingly named after our favourite SF TV antenna, which is neither sleek nor modern. Stroked outline icons, frosted
buttons, a volume pill that swings up over the mute button, tooltips, a settings menu (playback speed, quality,
subtitles), and timeline thumbnails. Ported from the
[Media Chrome theme of the same name](https://media-chrome.player.style/themes/sutro).

Ships an HTML custom element and a React component that share one stylesheet.

## HTML

```html
<script type="module">
  import '@videojs/html/video/player';
  import '@player.style/sutro/html';
</script>

<video-player>
  <sutro-skin>
    <video src="https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4"></video>
    <img slot="poster" src="https://image.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/thumbnail.webp" alt="" />
  </sutro-skin>
</video-player>
```

`<sutro-skin>` renders the theme in its shadow root around your media. The `poster` slot is optional; without it the
skin shows the player's poster.

## React

```tsx
import { Video, VideoPlayer } from '@videojs/react/video';
import { SutroSkin } from '@player.style/sutro/react';
import '@player.style/sutro/skin.css';

export function Player() {
  return (
    <VideoPlayer poster="https://image.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/thumbnail.webp">
      <SutroSkin>
        <Video src="https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4" />
      </SutroSkin>
    </VideoPlayer>
  );
}
```

`SutroSkin` accepts the props of the Video.js `Container` (`className`, `style`, …).

## Features

- Responsive: the controls scale from an 18px base to 20px from 480px wide and 24px in fullscreen; below 480px the bar
  drops the duration, captions and picture-in-picture buttons.
- Settings: playback speed, quality (when the media has more than one rendition), and subtitles (when it has text
  tracks). Entries the media cannot use are hidden.
- Tooltips on every button except mute, whose hover opens the volume pill instead.
- Thumbnails and chapters: a storyboard track (`kind="metadata"`) gives the scrub preview its image; a chapters track
  splits the progress bar and shows the chapter title above the pointer.
- AirPlay and Cast buttons appear when the browser and network offer a target.
- Keyboard: `Space`/`k` play, `m` mute, `f` fullscreen, `c` captions, `←`/`→` seek 10s, `↑`/`↓` volume.

## Theming

The skin reads the same colour tokens as the Media Chrome original, with the same defaults. `--media-accent-color`
is the brand colour: the original already coloured its fills with it, white when unset.

| Token | What it colours | Default |
| --- | --- | --- |
| `--media-accent-color` | The progress fill and thumb, and the volume fill. | `#fff` |
| `--media-primary-color` | Icons, the time, tooltip and menu text, and the error dialog's button. | `#fff` |
| `--media-secondary-color` | The buttons' background while hovered, under the frosted blur. | `transparent` |

The track, buffer, pointer highlight, thumbnail border and the highlighted menu item keep the theme's fixed whites and
greys, as in the original.

Other properties:

| Property | Default | Effect |
| --- | --- | --- |
| `--media-menu-background` | `rgb(28 28 28 / 0.6)` | The settings menu. |
| `--media-font-family` | Roboto, system UI stack | All text. |
| `--media-border-radius` | `0` | The player's corners. |
| `--media-object-fit`, `--media-object-position` | `contain`, `center` | How the media and poster fill the player. |

```html
<sutro-skin style="--media-accent-color: #fa50b5">
```

## Peer dependencies

`@videojs/html` for the HTML element, `@videojs/react` and `react` for the React component, all optional.

## License

MIT
