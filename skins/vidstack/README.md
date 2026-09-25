# @player.style/vidstack

The [Vidstack](https://player.style/skins/vidstack) skin for [Video.js 10](https://videojs.org): the default video
layout of the [Vidstack](https://vidstack.io) player (`<media-video-layout>` with the default theme), recreated from
`vidstack` 1.15.6 in its dark colour scheme. A soft black gradient behind the controls, a thin time slider riding
just above a row of round, tooltip-labelled buttons, a volume slider that opens out of the mute button, a settings
menu, and a separate small-screen layout with the play button in the middle.

Ships an HTML custom element and a React component that share one stylesheet.

## HTML

```html
<script type="module">
  import '@videojs/html/video/player';
  import '@player.style/vidstack/html';
</script>

<video-player>
  <vidstack-skin>
    <video src="https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4"></video>
    <img slot="poster" src="https://image.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/thumbnail.webp" alt="" />
  </vidstack-skin>
</video-player>
```

`<vidstack-skin>` renders the skin in its shadow root around your media. The `poster` slot is optional; without it
the skin shows the player's poster.

## React

```tsx
import { Video, VideoPlayer } from '@videojs/react/video';
import { VidstackSkin } from '@player.style/vidstack/react';
import '@player.style/vidstack/skin.css';

export function Player() {
  return (
    <VideoPlayer poster="https://image.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/thumbnail.webp">
      <VidstackSkin>
        <Video src="https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4" />
      </VidstackSkin>
    </VideoPlayer>
  );
}
```

`VidstackSkin` accepts the props of the Video.js `Container` (`className`, `style`, …).

## Features

- Large layout (677px and wider): the time slider over one row of 38px buttons, in the original's order: play, mute
  with its sliding volume slider, current time / duration, the title, captions, settings, AirPlay, Google Cast,
  picture-in-picture and fullscreen. Buttons light up in a circle and grow 5% under the pointer.
- Small layout (below 677px, where a 16:9 Vidstack player switches): AirPlay and Google Cast top left; captions,
  settings and mute top right, with the volume slider in a box below the mute button; a round play button in the
  middle; time and fullscreen over the slider along the bottom. Before the first play only the play button and a
  duration chip show.
- Time slider: a 5px track that thickens under the pointer, the loaded range, a white thumb that fades in, chapter
  gaps, and a preview with the storyboard thumbnail (when the media has one), the chapter title and the time.
- Tooltips on every button after 700ms, with Vidstack's texts (`Play`/`Pause`, `Mute`/`Unmute`,
  `Closed-Captions On`/`Off`, `Settings`, `Enter PiP`/`Exit PiP`, `Enter Fullscreen`/`Exit Fullscreen`).
- Settings: Speed, Quality (when the media has renditions) and Captions (when it has text tracks), each showing its
  current value and opening a list. The gear turns a quarter while the menu is open. In the small layout the menu is a
  sheet along the bottom of the viewport, as the original's.
- The brand-coloured ring spinner as soon as playback stalls, and the blue focus ring for keyboard users.
- Keyboard: `k`/`Space` play, `m` mute, `f` fullscreen, `i` picture-in-picture, `c` captions, `j`/`ArrowLeft` and
  `l`/`ArrowRight` seek 10s, `ArrowUp`/`ArrowDown` volume 5%. Click the picture to play or pause, double click for
  fullscreen, and double tap either side to seek.

## Theming

Set these custom properties on `<vidstack-skin>` (or on `VidstackSkin` through `style`/`className`).

| Token | What it colours | Default |
| --- | --- | --- |
| `--media-accent-color` | Vidstack's brand colour (`--video-brand`): the slider fills and the spinner. | `#f5f5f5` |
| `--media-primary-color` | Icons, text and the spinner's track (`--video-controls-color`). | `#f5f5f5` |
| `--media-secondary-color` | The tooltips, the settings menu and the volume box. | `#000` (tooltips), `rgb(10 10 10)` (menu, volume box) |
| `--media-font-family` | Times, tooltips, menus and the title. | `sans-serif` |
| `--media-border-radius` | The player's corners. | `6px` |
| `--media-object-fit`, `--media-object-position` | How the media and poster fill the player. | `contain`, `center` |

With no tokens set the skin draws Vidstack's default dark theme exactly. The focus ring keeps Vidstack's blue,
`rgb(78 156 246)`, whatever the accent.

```html
<vidstack-skin style="--media-accent-color: #f43f5e">
```

## Differences from Vidstack

- Times follow Video.js 10's format, which pads the minutes of a media 10 minutes or longer (`03:43 / 10:34` where
  Vidstack showed `3:43 / 10:34`).
- Settings holds Speed, Quality and Captions. Speed is a list of Video.js 10's rates rather than Vidstack's 0–2×
  slider, and the Accessibility (announcements, keyboard animations, caption styles) and Audio (boost, tracks)
  submenus are not there: Video.js 10 has no caption styling, audio gain or announcement settings to drive them. An
  open submenu's heading does not repeat the current value.
- The Google Cast and AirPlay buttons show only when Video.js 10 can cast to them; Vidstack showed Google Cast in
  every Chromium browser.
- The layout switches on the player's width only (below 677px). Vidstack also switched on a height under 380px,
  which only differs from the width rule for players that are not 16:9.
- Double tap seeks on the outer thirds of the picture and double click toggles fullscreen in the middle third;
  Vidstack used the outer fifths.
- There are no `<` and `>` speed shortcuts and no keyboard action flash in the middle of the picture.
- Captions render as the browser's own cues rather than Vidstack's caption overlay.

## Open files

`dist/open/` holds the skin as files to copy into a project: `skin.html`, `skin.css`, `register.ts`, `Skin.tsx` and a
README with the paste instructions.

## Peer dependencies

`@videojs/html` for the HTML element, `@videojs/react` and `react` for the React component, all optional.

## Credits

A recreation of the default video layout and theme of [Vidstack Player](https://github.com/vidstack/player) 1.15.6
(npm `vidstack`), by Rahim Alwer and the Vidstack contributors. The original stylesheets and the
[media-icons](https://github.com/vidstack/media-icons) whose SVG paths this skin inlines are available under the MIT
License.

## License

MIT
