# @player.style/winamp

The [Winamp](https://player.style/skins/winamp) skin for [Video.js 10](https://videojs.org): a retro theme inspired by
the classic Winamp media player, by [@maveio](https://github.com/maveio). The main window (LCD time readout, scrolling
marquee, VU meter, transport buttons, position and volume bars) sits above a bitmap-framed video window. Ported from
the [Media Chrome theme of the same name](https://media-chrome.player.style/themes/winamp).

Ships an HTML custom element and a React component that share one stylesheet. The theme's bitmaps (22 PNGs and the
animated VU-meter GIF, ≈54 KB, ≈73 KB as base64) are inlined in that stylesheet as data URIs, so `skin.css` (≈88 KB
unminified) is the only file to import.

## HTML

```html
<script type="module">
  import '@videojs/html/video/player';
  import '@player.style/winamp';
</script>

<video-player>
  <winamp-skin>
    <video src="https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4"></video>
    <img slot="poster" src="https://image.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/thumbnail.webp" alt="" />
  </winamp-skin>
</video-player>
```

`<winamp-skin>` renders the theme in its shadow root and places your media in the video window. The `poster` slot is
optional; without it the skin shows the player's poster.

## React

```tsx
import { Video, VideoPlayer } from '@videojs/react/video';
import { WinampSkin } from '@player.style/winamp/react';
import '@player.style/winamp/skin.css';

export function Player() {
  return (
    <VideoPlayer poster="https://image.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/thumbnail.webp">
      <WinampSkin>
        <Video src="https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4" />
      </WinampSkin>
    </VideoPlayer>
  );
}
```

`WinampSkin` accepts the props of the Video.js `Container` (`className`, `style`, …).

## Layout

A fixed-size skin, as the original was: 275 × 264px (a 275 × 116 main window over a 275 × 148 video window whose
screen is 256 × 108), centred in whatever width it is given. It does not scale or reflow; there are no breakpoints.
The controls never auto-hide.

- The transport row's play, pause, and stop buttons each toggle playback, as in the original; the seek buttons skip
  30 seconds; the eject button enters fullscreen. So do the play-state light and the VU meter, which were play
  buttons in the original too.
- The shuffle button is the captions toggle and only appears when the media has text tracks. EQ, PL, repeat, balance,
  mono/stereo, and the "192 kbps / 44 kHz" readouts are static artwork.
- The marquee scrolls "Video.js, it really whips the llama's ass!" (the original said "Media Chrome, …"). Like the
  original's `<marquee>` in Chromium, it keeps scrolling under `prefers-reduced-motion: reduce`.
- Fullscreen shows the video alone, filling the screen, as the original's did; the Winamp chrome steps aside.
- A click on the picture toggles playback; clicks on the frame and the main window do not.
- The theme names its own fonts (`winamp-numbers`, `winamp`) but never loaded them, so the readouts render in Monaco
  where it exists and in the browser's default font elsewhere. The port keeps those stacks verbatim.

### Why the video preset

The Media Chrome theme's docs page flags it `audio: true`, but its template renders a video window (`<slot
name="media">` inside a black `media-controller`, with a poster slot and a fullscreen button) under the Winamp main
panel, and [videojs/v10#2714](https://github.com/videojs/v10/pull/2714) ported it as video. It therefore targets the
`video` preset (`<video-player>` / `VideoPlayer`) at the original's fixed 275px width. Nothing in the original needed
the audio preset: the whole theme ports to `<video-player>` as it stood.

## Theming

The original read no colour token; everything but the LCD text is bitmap artwork. `--media-accent-color` recolours
the LCD green, the theme's one brand colour that is not a bitmap.

| Token | What it colours | Default |
| --- | --- | --- |
| `--media-accent-color` | The LCD text: time, marquee, and kbps/kHz readouts (and the keyboard focus outline). | `#00e201` |

`--media-primary-color` and `--media-secondary-color` change nothing, as in the original. The VU meter, the play-state
light, the slider handles and every other piece of artwork keep their bitmap colours.

Other properties:

| Property | Default | Effect |
| --- | --- | --- |
| `--media-object-fit` | `contain` (video), `fill` (poster) | How the media and poster fill the screen. The original stretches the poster over the whole screen; so does the port. |
| `--media-object-position` | `center` | Where the media and poster sit in the screen. |

```html
<winamp-skin style="--media-accent-color: #f5c518">
```

## Peer dependencies

`@videojs/html` for the HTML edition, `@videojs/react` and `react` for the React edition, all optional.

## License

MIT
