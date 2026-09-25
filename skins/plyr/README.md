# @player.style/plyr

The [Plyr](https://player.style/skins/plyr) skin for [Video.js 10](https://videojs.org): the default look of the Plyr
player, recreated from the 3.8.4 stylesheet and icon sprite. A black gradient under a row of white icons, the round
blue-filled progress and volume sliders with their white thumbs, the white seek-time tooltip, the blue circular play
button in the middle, and the translucent white settings menu.

Ships an HTML custom element and a React component that share one stylesheet.

## HTML

```html
<script type="module">
  import '@videojs/html/video/player';
  import '@player.style/plyr/html';
</script>

<video-player>
  <plyr-skin>
    <video src="https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4"></video>
    <img slot="poster" src="https://image.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/thumbnail.webp" alt="" />
  </plyr-skin>
</video-player>
```

`<plyr-skin>` renders the skin in its shadow root around your media. The `poster` slot is optional; without it the
skin shows the player's poster.

## React

```tsx
import { Video, VideoPlayer } from '@videojs/react/video';
import { PlyrSkin } from '@player.style/plyr/react';
import '@player.style/plyr/skin.css';

export function Player() {
  return (
    <VideoPlayer poster="https://image.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/thumbnail.webp">
      <PlyrSkin>
        <Video src="https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4" />
      </PlyrSkin>
    </VideoPlayer>
  );
}
```

`PlyrSkin` accepts the props of the Video.js `Container` (`className`, `style`, …).

## Features

- Plyr's default `controls`, in its order: play, progress, the time, mute and volume, captions (only when the media
  has text tracks), settings, picture-in-picture (where supported), AirPlay (where available) and fullscreen.
- The big play button over the picture whenever playback is not running, brightening under the pointer.
- The bar stays up while paused or while the pointer rests on it, and slides down and fades 2 seconds after activity
  during playback.
- Progress: a 5px rounded track with the buffered range, the accent fill, a 13px white thumb that takes a white ring
  while dragged, and the seek tooltip that grows in at the pointer. As in Plyr there is no spinner: 250ms into a
  stall the buffer bar turns to moving stripes.
- The time shows the duration until playback starts, then the time left (`-06:51`).
- Settings: Captions, Quality and Speed pages, each listed only when the media offers the choice, with Plyr's round
  radio options and `Normal`, `1.5×` speed labels.
- Buttons fill with the accent on hover, on keyboard focus (with Plyr's dashed focus outline) and while their menu is
  open; the gear turns a quarter.
- Keyboard: `Space`/`k` play, `m` mute, `f` fullscreen, `c` captions, `←`/`→` seek 10s, `↑`/`↓` volume, `0`–`9` jump
  to 0–90%. Click the picture to play or pause, double-click it for fullscreen.

Like the original, the skin keeps fixed pixel sizes (32px buttons with 18px icons, a 48px big play button) at every
player size. From 480px wide the bar is padded 35px 10px 10px, below that 20px 5px 5px.

## Theming

Set these custom properties on `<plyr-skin>` (or on `PlyrSkin` through `style`/`className`).

| Token | What it colours | Default |
| --- | --- | --- |
| `--media-accent-color` | Plyr's `--plyr-color-main`: the big play button, hovered and focused buttons, the progress and volume fills, focus outlines, and the hovered and checked menu options. | `hsl(198deg 100% 50%)` (`#00b2ff`) |
| `--media-primary-color` | Icons, the time, the slider thumbs, and text on the accent (Plyr's `--plyr-video-control-color`). | `#fff` |
| `--media-secondary-color` | The controls gradient, drawn from transparent to 75%. | `#000` |
| `--media-font-family` | The time, the tooltip, the menu and the error text. | `-apple-system, blinkmacsystemfont, "Segoe UI", helvetica, arial, sans-serif` |
| `--media-border-radius` | The player's corners. | `0` |
| `--media-object-fit`, `--media-object-position` | How the media and poster fill the player. | `contain`, `center` |

The tooltip and menu surfaces keep Plyr's own colours, exposed as `--ps-tooltip-background` (`#fff`),
`--ps-tooltip-color` and `--ps-menu-color` (Plyr's grey `hsl(216deg 15% 34%)`), and `--ps-menu-background`
(`rgb(255 255 255 / 0.9)`). With no tokens set the skin draws Plyr's default look.

```html
<plyr-skin style="--media-accent-color: #e5091a">
```

## Differences from Plyr

- Plyr inherits the page's font; the skin pins a system sans-serif stack so it looks the same on any page. Set
  `--media-font-family: inherit` to follow the page as Plyr did.
- The time cannot be clicked to switch between remaining and elapsed time. Video.js 10's toggleable time switches
  remaining with duration, or starts from elapsed, so neither matches Plyr's `invertTime` + `toggleInvert`.
- Video.js 10 pads minutes only for media of 10 minutes or more, so a short clip reads `-0:51` where Plyr showed
  `-00:51`.
- The speed choices are Video.js 10's fixed `0.2×`–`2×` set (`0.2 0.5 0.7 1 1.2 1.5 1.7 2`); Plyr offered
  `0.5 0.75 1 1.25 1.5 1.75 2 4`. The quality page lists Video.js 10's renditions with an `Auto` choice, and the captions
  page says `Off` where Plyr said `Disabled`.
- A settings page taller than the player scrolls inside it; Plyr let the menu spill out over the page. Pages swap in
  place without Plyr's width and height tween between them.
- The loading stripes show while playback stalls, not during seeks while paused, and the control bar does not force
  itself up while loading.
- Captions are the browser's own rendering of the text track; Plyr drew its own caption boxes and lifted them above the
  bar. The `l` (loop) shortcut and Plyr's full-window fallback when fullscreen is unavailable are not included.
- The HTML element sets the `Normal` speed label in script, so the copy-paste HTML in the open files shows `1×`.

## Open files

`dist/open/` holds the skin as files to copy into a project: `skin.html`, `skin.css`, `register.ts`, `Skin.tsx` and a
README with the paste instructions.

## Peer dependencies

`@videojs/html` for the HTML element, `@videojs/react` and `react` for the React component, all optional.

## Credits

A recreation of the default video skin of [Plyr](https://github.com/sampotts/plyr) 3.8.4 by Sam Potts. The original
stylesheet and the Plyr icon sprite, whose SVG paths this skin inlines, are copyright Sam Potts and available under
the MIT License.

## License

MIT
