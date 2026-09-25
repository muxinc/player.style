# @player.style/videojs-3

The [Video.js 3](https://player.style/skins/videojs-3) skin for [Video.js 10](https://videojs.org): the 2011 Video.js
default skin, recreated from the stylesheet and PNG sprite of Video.js 3.2. A full-width bar of black glass split at
half height, the progress in a row of its own above it between the current and remaining times, embossed grey icons
from the original sprite, an always-visible volume slider, and a charcoal big play button with a white halo.

Ships an HTML custom element and a React component that share one stylesheet, on the video preset.

## HTML

```html
<script type="module">
  import '@videojs/html/video/player';
  import '@player.style/videojs-3/html';
</script>

<video-player>
  <videojs-3-skin>
    <video src="https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4"></video>
    <img slot="poster" src="https://image.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/thumbnail.webp" alt="" />
  </videojs-3-skin>
</video-player>
```

`<videojs-3-skin>` renders the theme in its shadow root around your media. The `poster` slot is optional; without it
the skin shows the player's poster.

## React

```tsx
import { Video, VideoPlayer } from '@videojs/react/video';
import { Videojs3Skin } from '@player.style/videojs-3/react';
import '@player.style/videojs-3/skin.css';

export function Player() {
  return (
    <VideoPlayer poster="https://image.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/thumbnail.webp">
      <Videojs3Skin>
        <Video src="https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4" />
      </Videojs3Skin>
    </VideoPlayer>
  );
}
```

`Videojs3Skin` accepts the props of the Video.js `Container` (`className`, `style`, …).

## Features

- The 3.2 layout at its original pixel sizes: a 26px bar split between `#242424` and `#1f1f1f` (fading to `#171717`)
  under a 1px `#404040` line; play on the left; mute, a 50 × 6px volume slider and fullscreen on the right.
- The progress row sits 13px above the bar between two 48px readouts, current time left (`03:43`) and remaining time
  right (`-6:51`), in 10px Helvetica/Arial. The recessed 10px capsule fills with glossy white, the buffered range shows
  in grey, and the handle is the sprite's round glossy button. As in 3.2, the handle never leaves the capsule: the
  pointer is measured across the capsule less the handle's width.
- Every icon is the original 137 × 116 `video-js.png` sprite, inlined as a data URL and positioned per control: play
  and pause, fullscreen in and out, the big play triangle, the four speaker states and the seek handle.
- The big play button: 80px of charcoal gloss in a 2px white border with 25px corners, its drop shadow turning into an
  80px white halo on hover. It shows until the first play and again at the end.
- The spinner is 3.2's ring of eight white balls, fading round the circle and stepping 45 degrees every eighth of a
  second.
- The bar stays hidden until the first play. After that it fades in over 0.3s whenever the pointer is over the player
  and fades out over 1.5s once it leaves, with no idle timeout, playing or paused, as in 3.2.
- A captions button, 3.2's small glossy menu button with its CC glyph, appears when the media has text tracks.
- Keyboard: `Space`/`k` play, `m` mute, `f` fullscreen, `c` captions, `←`/`→` seek 5s, `↑`/`↓` volume. 3.2 had no
  player-wide shortcuts; these are Video.js 10's.

## Differences from Video.js 3.2

- Remaining time: 3.2 printed it without padding (`-6:51`) while Video.js 10 pads it like the current time. Under an
  hour the skin takes the extra zero back out, so both readouts match 3.2. From an hour on, Video.js 10 prints the
  remaining time with the duration's hours (`-0:06:51`), where 3.2 printed `-6:51`.
- Video.js 10 reads a paused player at 0s as not started, so the big play button comes back there and the bar hides
  unless focus is inside it. 3.2 counted playback as started for good.
- 3.2 faded the bar in on the first play even with the pointer elsewhere. Here it shows while the pointer is over the
  player or keyboard focus is inside the bar. On touch screens, which have no hover, Video.js 10's own controls
  visibility decides: a tap shows the bar and it fades after two idle seconds of playback. A tap leaves no hover
  behind there, so it never holds the bar or the big play button's halo.
- Phones and touch screens, which 3.2's skin never adapted to: on a coarse pointer the bar is 44px tall with controls
  at least 44px wide, the captions button takes taps across 44 × 44 round its glossy face, and the progress capsule
  takes taps 31px above it, so every tap target is 44 × 44. The sprite glyphs stay as they are, centred. A double tap
  never zooms the page.
- The faded bar stays reachable from the keyboard, and focused controls show 3.2's own commented-out `#555` focus
  background. 3.2 hid the bar with `visibility: hidden` and set `outline: 0` with no replacement.
- The speaker shows one, two and three waves below 50%, below 75% and above, which are Video.js 10's volume levels.
  3.2 switched at one and two thirds.
- The spinner shows only while the media waits during playback, which is Video.js 10's buffering state. 3.2 also
  showed it while seeking a paused player.
- Captions toggle on and off, with the button pressed in while they show. 3.2 opened a menu of tracks and styled the
  cues itself (captions in `#fc6`); here the browser draws the cues.
- The volume slider takes the pointer across the control's full height; 3.2 took it on the 6px bar and its handle.
  Where the media's volume cannot be set (iOS) the slider leaves the bar and the mute button stays.
- Errors show in 3.2's menu popup style. 3.2 had no error display.

## Theming

Set these custom properties on `<videojs-3-skin>` (or on `Videojs3Skin` through `style`/`className`). Unset, the
skin paints exactly the 3.2 colours: the shades around each token are mixed from it at the ratios that give 3.2's own
values back.

| Token | What it colours | Default |
| --- | --- | --- |
| `--media-accent-color` | The glossy progress fill and the volume level, shaded down for the gloss. | `#fff` |
| `--media-secondary-color` | The black glass: the bar, its top line, and the progress row and time readouts behind the capsule. | `#242424` |
| `--media-primary-color` | The time readouts, the big play button's border and the spinner balls. | `#fff` |
| `--media-font-family` | The time readouts. | `helvetica, arial, sans-serif` |
| `--media-border-radius` | The player's corners. | `0` |
| `--media-object-fit` | How the media and poster fill the player. | `contain` (video), `fill` (poster) |
| `--media-object-position` | Where the media and poster sit in the player. | `center` |

The sprite icons keep their grey, and the rest keeps the original's fixed values: the recessed `#111` to `#262626`
capsule, the `#666` to `#333` buffered range, the charcoal big play button and its white halo, the `#ccc` volume handle,
and the captions button's gloss. As in 3.2, the poster spans the player's width and is capped at its height.

```html
<videojs-3-skin style="--media-accent-color: #e5091a; --media-secondary-color: #1a2a4a">
```

## Open files

`dist/open/` holds the skin as files to copy into a project: `skin.html`, `skin.css`, `register.ts`, `Skin.tsx` and
a README with the paste instructions.

## Peer dependencies

`@videojs/html` for the HTML element, `@videojs/react` and `react` for the React component, all optional.

## Credits

A recreation of the default skin of [Video.js](https://github.com/videojs/video.js) 3.2 (2012), the design used from
Video.js 3.0 (2011) to 3.2.3. The icons are its `video-js.png` sprite, inlined unchanged. Video.js is © the Video.js
contributors, licensed under the [Apache License 2.0](https://github.com/videojs/video.js/blob/main/LICENSE).

## License

MIT
