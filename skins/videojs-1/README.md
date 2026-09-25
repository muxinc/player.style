# @player.style/videojs-1

The [Video.js 1](https://player.style/skins/videojs-1) skin for [Video.js 10](https://videojs.org): the original 2010
Video.js default skin by [Steve Heffernan](https://github.com/heff), recreated from the Video.js 1.1.5 stylesheet.
Separate floating aqua pills with a hard glossy split, a progress bar fused to its `03:43 / 10:35` time readout, six
stepped volume bars in place of a mute button, and a rounded big play button with a white halo, every icon drawn from
the original's CSS border triangles.

Ships an HTML custom element and a React component that share one stylesheet.

## HTML

```html
<script type="module">
  import '@videojs/html/video/player';
  import '@player.style/videojs-1/html';
</script>

<video-player>
  <videojs-1-skin>
    <video src="https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4"></video>
    <img slot="poster" src="https://image.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/thumbnail.webp" alt="" />
  </videojs-1-skin>
</video-player>
```

`<videojs-1-skin>` renders the theme in its shadow root around your media. The `poster` slot is optional; without it
the skin shows the player's poster.

## React

```tsx
import { Video, VideoPlayer } from '@videojs/react/video';
import { Videojs1Skin } from '@player.style/videojs-1/react';
import '@player.style/videojs-1/skin.css';

export function Player() {
  return (
    <VideoPlayer poster="https://image.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/thumbnail.webp">
      <Videojs1Skin>
        <Video src="https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4" />
      </Videojs1Skin>
    </VideoPlayer>
  );
}
```

`Videojs1Skin` accepts the props of the Video.js `Container` (`className`, `style`, …).

## Features

- Layout, as in 1.1.5: play, then progress and time as one pill, then the volume bars, then fullscreen, each a 25px
  pill floating 5px above the bottom edge. Sizes are fixed pixels, as the original never scaled with the player.
- Volume: click or drag across the six bars. `ceil(volume × 6)` bars light up, as in the original. There is no mute
  button, as there was none in 1.x; `m` mutes, and a muted player shows every bar off.
- The progress bar has no handle, hover state or tooltip, as in the original. It is still a keyboard slider.
- The control bar stays hidden until the first play, then shows on mouse move and hides about 4s after the last move
  or when the pointer leaves, with no fade, paused or not. The pointer resting on the bar keeps it up.
- The big play button shows until the first play and again at the end. The eight-dot spinner steps round 45 degrees
  every 100ms while the media waits for data.
- The poster stretches to fill the player, as the original's `<img>` overlay did.
- Keyboard: `Space`/`k` play, `m` mute, `f` fullscreen, `←`/`→` seek 5s, `↑`/`↓` volume. The original had no
  shortcuts.

## Differences from Video.js 1.1.5

- The time readout pads minutes to two digits as the original did (`03:43`), but whole seconds are rounded down, where
  1.x rounded to the nearest second, so a duration of 10:34.6 reads `10:34` rather than `10:35`. From one hour on, Video.js
  10 prints hours (`1:05:30`); 1.x kept counting minutes (`65:30`).
- The bar hides after Video.js 10's fixed 2s of inactivity plus a 2s delay in the stylesheet, so about 4s, as in 1.x.
- The big play button and spinner are centred on the player. The 1.x player box was 4px taller than its video (the
  inline `<video>` baseline gap), which put them 2px lower.
- Controls show a dotted focus outline for keyboard users; 1.x had no focus styles.
- Phones and touch screens, which 1.x's skin never adapted to: on a coarse pointer the play and fullscreen pills are
  39px wide, so with the 5px gaps each owns 44px, and every pill takes taps from 14px above it down to the player's
  edge, so each tap target is 44 × 44 while the pills stay 25px tall. A tap shows the bar; while playing it hides
  about 4s after the last tap, and while paused it stays up (a finger has no mouse move to call it back, and Video.js
  10 reads a tap on a paused picture as a request to hide the controls). The tapped pill does not hold the bar up as a
  resting mouse does. A double tap never zooms the page.
- Where the media's volume cannot be set (iOS), the volume pill leaves the strip rather than stay behind empty; the
  phone's own volume buttons stand in, and there is still no mute button, as in 1.x.
- On a narrow player the progress capsule keeps its room: below 340px the readout shows only the current time, and
  below 300px the volume pill leaves the strip. 1.x kept every pill at every size.

## Theming

Set these custom properties on `<videojs-1-skin>` (or on `Videojs1Skin` through `style`/`className`). Unset, the
skin paints exactly the 1.1.5 colours.

| Token | What it colours | Default |
| --- | --- | --- |
| `--media-accent-color` | The aqua: the light end of the glossy gradient on every pill and on the big play button. | `#1f3744` |
| `--media-secondary-color` | The dark end of that gradient. | `#0b151a` |
| `--media-primary-color` | Icons, the time readout, the big play button's border and triangle, the top of the progress fill, and lit volume bars. | `#fff` |
| `--media-font-family` | The time readout and the error dialog. | `helvetica, arial, sans-serif` |
| `--media-border-radius` | The player's corners. | `0` |
| `--media-object-fit` | How the media and poster fill the player. | `contain` (video), `fill` (poster) |
| `--media-object-position` | Where the media and poster sit in the player. | `center` |

The rest keeps the original's fixed values: the `#777` progress outline and fill end, the `#555` to `#aaa` buffer, the
`#555` unlit bars, the `#ccc` rims on the spinner dots, the white hover halo, and the 85% opacity of the control bar.

```html
<videojs-1-skin style="--media-accent-color: #c0392b; --media-secondary-color: #2a0707">
```

## Peer dependencies

`@videojs/html` for the HTML element, `@videojs/react` and `react` for the React component, all optional.

## License

MIT
