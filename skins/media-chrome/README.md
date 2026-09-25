# @player.style/media-chrome

The [Media Chrome](https://player.style/skins/media-chrome) skin for [Video.js 10](https://videojs.org): the look
Media Chrome's web components ship with before any theme, recreated from media-chrome 4.19.2. A bare, dark strip along
the bottom in which every control paints its own translucent background, 24px icons, thin range tracks with a round
thumb, bold `1x` rate text, and tooltips on every button.

Ships an HTML custom element and a React component that share one stylesheet.

## HTML

```html
<script type="module">
  import '@videojs/html/video/player';
  import '@player.style/media-chrome/html';
</script>

<video-player>
  <media-chrome-skin>
    <video src="https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4"></video>
    <img slot="poster" src="https://image.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/thumbnail.webp" alt="" />
  </media-chrome-skin>
</video-player>
```

`<media-chrome-skin>` renders the skin in its shadow root around your media. The `poster` slot is optional; without
it the skin shows the player's poster.

## React

```tsx
import { Video, VideoPlayer } from '@videojs/react/video';
import { MediaChromeSkin } from '@player.style/media-chrome/react';
import '@player.style/media-chrome/skin.css';

export function Player() {
  return (
    <VideoPlayer poster="https://image.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/thumbnail.webp">
      <MediaChromeSkin>
        <Video src="https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4" />
      </MediaChromeSkin>
    </VideoPlayer>
  );
}
```

`MediaChromeSkin` accepts the props of the Video.js `Container` (`className`, `style`, …).

## Features

- The documented basic control bar, in its order: play, seek back and forward 30 seconds (the "30" arrows), mute,
  volume range, time range, current / duration time, captions (only when the media has text tracks), playback rate
  (`1x`), picture-in-picture (where supported) and fullscreen.
- Each control on `rgb(20 20 30 / 0.7)`, lightening to `rgb(50 50 70 / 0.7)` under the pointer; the inset blue focus
  ring for keyboard focus only.
- Ranges: a 4px track between 10px gaps, the buffered range, a 10px round thumb. The time range shows a preview box
  above the pointer: the time chip with its arrow, under the storyboard thumbnail when the media has one.
- Tooltips on every button with Media Chrome's words ("Seek backward", "Enter fullscreen mode", …), 12px above the
  button, fading in over 0.3s.
- A click on the time display flips it to the remaining time.
- Before the first play: the poster under the full control bar (Media Chrome's components have no big play button;
  a click on the picture plays). The half-ring loading indicator 0.5s into a stall. While playing, the controls fade
  out over 1s after two idle seconds or as soon as the pointer leaves, and stay up while the pointer is on them.
- Keyboard: `Space`/`k` play, `m` mute, `f` fullscreen, `c` captions, `p` picture-in-picture, `←`/`j` and `→`/`l`
  seek 10s, `↑`/`↓` volume, `<`/`>` rate: media-controller's default hotkeys.

Like the original, every size is fixed in pixels: a 44px bar at every player size.

## Theming

The skin reads Media Chrome's own `--media-*` custom properties, with the same fallbacks and the same defaults, so CSS
written for Media Chrome's components restyles it the same way. Set them on `<media-chrome-skin>` (or on
`MediaChromeSkin` through `style`/`className`).

| Token | What it colours | Default |
| --- | --- | --- |
| `--media-primary-color` | Text, icons, and the range fills and thumbs. | `rgb(238 238 238)` |
| `--media-secondary-color` | The control, tooltip and preview backgrounds. | `rgb(20 20 30 / 0.7)` |
| `--media-accent-color` | The range fills and thumbs (Media Chrome paints them in its primary colour). | `--media-primary-color` |
| `--media-font-family` | All text. | `helvetica neue, segoe ui, roboto, arial, sans-serif` |
| `--media-border-radius` | The player's corners. | `0` |
| `--media-object-fit`, `--media-object-position` | How the media and poster fill the player. | `contain`, `center` |
| `--media-background-color` | Behind the media. | `#000` |
| `--media-control-background`, `--media-control-hover-background` | Each control, at rest and under the pointer. | `--media-secondary-color`, `rgb(50 50 70 / 0.7)` |
| `--media-text-color`, `--media-icon-color` | Text, icons. | `--media-primary-color` |
| `--media-font`, `--media-font-size`, `--media-font-weight`, `--media-text-content-height` | The `font` shorthand of buttons, text, tooltips. | `bold 14px/24px` buttons, `normal 14px/24px` time, `400 13px/18px` tooltips |
| `--media-control-height`, `--media-control-padding`, `--media-button-padding` | Icon height and line height; control padding. | `24px`, `10px` (`10px 5px` for the rate button) |
| `--media-button-icon-width`, `--media-button-icon-height`, `--media-button-icon-transform`, `--media-button-icon-transition` | Button icons. | from the viewBox, `24px` |
| `--media-focus-box-shadow` | The keyboard focus ring. | `inset 0 0 0 2px rgb(27 127 204 / 0.9)` |
| `--media-range-padding`, `--media-range-padding-left`, `--media-range-padding-right` | The gaps either side of a range's track. | `10px` |
| `--media-range-track-height`, `-background`, `-border`, `-border-radius`, `-box-shadow`, `-outline`, `-backdrop-filter`, `-width` | Range tracks. | `4px`, `rgb(255 255 255 / 0.2)`, none, `1px` |
| `--media-range-bar-color`, `--media-time-range-buffered-color` | The range fill; the buffered range. | `--media-accent-color`, `rgb(255 255 255 / 0.4)` |
| `--media-range-track-pointer-background`, `--media-range-track-pointer-border-right` | The pointer bar under hover. | unpainted |
| `--media-range-thumb-width`, `-height`, `-background`, `-border`, `-border-radius`, `-box-shadow`, `-opacity`, `-transform`, `-transition` | Range thumbs. | `10px` disc in `--media-accent-color` |
| `--media-tooltip-display`, `-background`, `-background-color`, `-padding`, `-border`, `-border-radius`, `-distance`, `-filter`, `-z-index`, `-white-space`, `-arrow-width`, `-arrow-height`, `-arrow-color`, `-arrow-display` | Button tooltips (`--media-tooltip-display: none` turns them off). | `--media-secondary-color`, `0.35em 0.7em`, `5px`, `12px`, arrow 12 × 5 |
| `--media-preview-background`, `--media-preview-border-radius`, `--media-box-border-radius`, `--media-preview-time-*`, `--media-preview-thumbnail-*`, `--media-box-arrow-*`, `--media-preview-transition-*` | The time range's preview box. | the control background, `4px`, `3.5px 9px` |
| `--media-loading-indicator-icon-width`, `-icon-height`, `-opacity`, `-display` | The loading indicator. | `100px` |
| `--media-control-transition-in`, `--media-control-transition-out` | The controls fading in and out. | `opacity 0.25s`, `opacity 1s` |
| `--media-control-display`, `--media-control-bar-display`, `--media-<control>-display` | Show or hide the bar or one control (`play-button`, `seek-button`, `mute-button`, `volume-range`, `time-range`, `time-display`, `captions-button`, `playback-rate-button`, `pip-button`, `fullscreen-button`). | `inline-flex` |

```html
<media-chrome-skin style="--media-accent-color: #f5c518; --media-secondary-color: rgb(106 27 154 / 0.7)">
```

## Differences from Media Chrome

- Times follow Video.js 10's format, which pads the minutes of a media 10 minutes or longer (`03:43 / 10:34` and a
  `06:33` preview where Media Chrome showed `3:43 / 10:34` and `6:33`), so the time display is a digit wider.
- The playback rate button cycles Video.js 10's rates (1, 1.2, 1.5, 1.7, 2, then 0.2, 0.5, 0.7); Media Chrome went
  from 2 back to 1. `<` and `>` step through the same list rather than by 0.25.
- Only the current time toggles to the remaining time on click; Media Chrome's whole display did.
- A button's tooltip closes when the button is pressed; Media Chrome's stayed up while hovered.
- The time range's preview box is not clamped to the bar's edges, and chapter segments and titles are not drawn.
- Controls the media cannot use (captions without text tracks, picture-in-picture or fullscreen where unsupported,
  volume on iOS) drop out of the bar, as Media Chrome's themes did; the bare components stayed visible.
- The seek buttons' "30" takes the offset from the markup, not from a `seekoffset` attribute.

## Open files

`dist/open/` holds the skin as files to copy into a project: `skin.html`, `skin.css`, `register.ts`, `Skin.tsx` and a
README with the paste instructions.

## Peer dependencies

`@videojs/html` for the HTML element, `@videojs/react` and `react` for the React component, all optional.

## Credits

A recreation of the default component styles of [Media Chrome](https://github.com/muxinc/media-chrome) 4.19.2 by
Mux, whose icon SVG paths this skin inlines. Media Chrome is available under the MIT License.

## License

MIT
