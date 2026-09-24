# @player.style/x-mas

The [X-mas](https://player.style/skins/x-mas) skin for [Video.js 10](https://videojs.org): a festive Christmas theme
with cozy red and green tones, twinkling lights, and a warm holiday vibe, by [@qualabs](https://github.com/qualabs).
Garlands of fairy lights hang along the top edge, the play button is a bauble on a wire (green to play, red to pause),
the progress bar is a candy cane with a Christmas tree for a thumb, and the volume slider is a candy-cane stick with a
bauble on top. Ported from the [Media Chrome theme of the same name](https://media-chrome.player.style/themes/x-mas).

Ships an HTML custom element and a React component that share one stylesheet. The live edition is its own package,
[`@player.style/x-mas-live`](../x-mas-live), built on the same stylesheet. The artwork is the original's inline SVG,
SMIL animations included: the lights twinkle and the baubles swing continuously, and like the original they do not
stop for `prefers-reduced-motion`.

## HTML

```html
<script type="module">
  import '@videojs/html/video/player';
  import '@player.style/x-mas/html';
</script>

<video-player>
  <x-mas-skin>
    <video src="https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4"></video>
    <img slot="poster" src="https://image.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/thumbnail.webp" alt="" />
  </x-mas-skin>
</video-player>
```

`<x-mas-skin>` renders the theme in its shadow root around your media. The `poster` slot is optional; without it the
skin shows the player's poster.

## React

```tsx
import { Video, VideoPlayer } from '@videojs/react/video';
import { XMasSkin } from '@player.style/x-mas/react';
import '@player.style/x-mas/skin.css';

export function Player() {
  return (
    <VideoPlayer poster="https://image.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/thumbnail.webp">
      <XMasSkin>
        <Video src="https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4" />
      </XMasSkin>
    </VideoPlayer>
  );
}
```

`XMasSkin` accepts the props of the Video.js `Container` (`className`, `style`, …).

## Live edition

The Media Chrome theme hid its time range when the stream was live. That layout ships as `@player.style/x-mas-live`
(`<x-mas-live-skin>`, `XMasLiveSkin`) on the Video.js live-video preset: a small bauble and "Live" take the time
range's place at the start of the bar. Its rules live in this package's `skin.css`, keyed on
`data-preset="live-video"`, so both packages ship the same stylesheet.

## Layout

The player is 16:9 and has one breakpoint, at 600px. Below it the bauble fills the player's height without its wire,
the control row is 24px tall, and the volume slider is hidden (mute only); from 600px the bauble hangs on its wire, the
row grows to 32px, and hovering or focusing the mute button opens the volume slider above it.

As in the original, clicking the picture does not toggle playback (only the bauble does), and the chrome stays up
while the mouse is over the player; it fades out when the mouse leaves during playback, or after two idle seconds on
touch. Cast and AirPlay show only when the media can use them. Keyboard: Space/K play and pause, M mutes, F toggles
fullscreen, C toggles captions, the arrow keys seek 10 seconds.

## Theming

Set these on the skin element or component (or any ancestor).

| Token | What it colours | Default |
| --- | --- | --- |
| `--media-accent-color` | The brand colour: the red stripes of the progress and volume candy canes, and the error dialog's button. | `#e72d33` |
| `--media-range-bar-color` | The whole candy-cane fill of both sliders; replaces the stripes, accent included. | red and white 45° stripes |
| `--media-range-track-background` | The unplayed part of the progress track and the volume track. | `rgb(255 255 255 / 0.4)` |
| `--media-text-color` | The scrub preview time, and the Live text in the live edition. | `#fff` |
| `--media-live-button-icon-color` | The live edition's bauble behind the live edge. | `rgb(140 140 140)` |
| `--media-live-button-indicator-color` | The live edition's bauble at the live edge. | `rgb(255 0 0)` |
| `--media-border-radius` | The player's corners. | `0` |
| `--media-object-fit`, `--media-object-position` | How the media and poster fill the player. | `contain`, `center` |

```html
<x-mas-skin style="--media-accent-color: #19bc8a">
```

The artwork keeps its own palette. The Media Chrome edition read `--media-accent-color` into a thumb colour
(`--media-tertiary-color`) that its artwork covered, so there the accent never showed; here it recolours the candy
canes. Its `--media-primary-color` (black) was media-chrome's icon fill, which every shape of the artwork overrides, so
neither token has anything to colour here.

Motion: the lights twinkle and the baubles swing (SMIL), and the button glyphs grow on hover, as in the original, which
had no `prefers-reduced-motion` rules.

## Open edition

`dist/open/` holds the skin as files to copy into a project: `skin.html`, `skin.css`, `register.ts`, `Skin.tsx` and a
README with the paste instructions.

## Peer dependencies

`@videojs/html` for the HTML edition, `@videojs/react` and `react` for the React edition, all optional.

## License

MIT
