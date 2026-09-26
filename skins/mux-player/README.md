# @player.style/mux-player

The [Mux Player](https://player.style/skins/mux-player) skin for [Video.js 10](https://videojs.org): the default look
of [Mux Player](https://github.com/muxinc/elements/tree/main/packages/mux-player) (its Gerwig theme), recreated from
`@mux/mux-player` 3.13.4. A transparent bar over a soft black gradient, 14px white icons that sit on a Mux pink square
when hovered, a thin seek bar with a pop-up thumb and a white-framed storyboard preview, white menus, the title in the
top-left corner, and the big black play button before the first play.

Ships an HTML custom element and a React component that share one stylesheet.

## HTML

```html
<script type="module">
  import '@videojs/html/video/player';
  import '@player.style/mux-player/html';
</script>

<video-player content-title="Big Buck Bunny">
  <mux-player-skin>
    <video src="https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4"></video>
    <img slot="poster" src="https://image.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/thumbnail.webp" alt="" />
  </mux-player-skin>
</video-player>
```

`<mux-player-skin>` renders the skin in its shadow root around your media. The `poster` slot is optional; without it
the skin shows the player's poster. The title comes from the player's `content-title` and is left out when there is
none.

## React

```tsx
import { Video, VideoPlayer } from '@videojs/react/video';
import { MuxPlayerSkin } from '@player.style/mux-player/react';
import '@player.style/mux-player/skin.css';

export function Player() {
  return (
    <VideoPlayer
      poster="https://image.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/thumbnail.webp"
      title="Big Buck Bunny"
    >
      <MuxPlayerSkin>
        <Video src="https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4" />
      </MuxPlayerSkin>
    </VideoPlayer>
  );
}
```

`MuxPlayerSkin` accepts the props of the Video.js `Container` (`className`, `style`, …).

## Features

- Before the first play: the poster and a 90px black play button that fills with the accent on hover and pops away
  when playback starts. The bars appear once playback has started.
- Control bar, in Mux Player's order: play, seek back and forward 10s, time (click the current time for the time
  remaining), mute and an always-open volume slider, then quality, playback rate, audio track, captions, AirPlay,
  cast, picture-in-picture and fullscreen. Controls the media cannot use are left out.
- Seek bar: a 4px track on the bar's top edge, the accent fill, a thumb that pops up on hover, and a preview of the
  storyboard thumbnail (from a `kind="metadata"` thumbnails track; the Mux media adds one itself) and time.
- Tooltips on every button, white menus for quality, audio track and captions (with CC badges on caption tracks), and
  a row of rates for the playback rate.
- Below 470px wide, as Mux Player: no title, the bar keeps mute, volume and the menus, and a plain play/pause sits in
  the middle.
- On a touch screen a tap on the picture shows or hides the controls, as Mux Player's did; where the volume cannot be
  set (iOS) the volume slider is left out and mute stays.
- Keyboard: `Space`/`k` play, `m` mute, `f` fullscreen, `c` captions, `←`/`→`/`j`/`l` seek 10s, `↑`/`↓` volume.

## Theming

Set these custom properties on `<mux-player-skin>` (or on `MuxPlayerSkin` through `style`/`className`). They are the
properties Mux Player's `accent-color`, `primary-color` and `secondary-color` attributes set.

| Token | What it colours | Default |
| --- | --- | --- |
| `--media-accent-color` | Button and play-button hovers, the seek fill and thumb, menu ticks, CC badges and hover outlines, the current rate. | `#fa50b5` |
| `--media-primary-color` | Icons, the buffered range, the preview and menu backgrounds, the volume thumb; also the bar text and volume fill, which are `rgb(238 238 238)` when it is unset. | `#fff` |
| `--media-secondary-color` | The surface behind the bar's controls, and the tooltips. | `transparent` (tooltips `rgb(20 20 30 / 0.7)`) |
| `--media-text-color` | Text on the white preview and menus. | `#000` |
| `--media-font-family` | All text. | `"helvetica neue", "segoe ui", roboto, arial, sans-serif` |
| `--media-border-radius` | The player's corners. | `0` |
| `--media-object-fit`, `--media-object-position` | How the media and poster fill the player. | `contain`, `center` |

```html
<mux-player-skin style="--media-accent-color: #00aa3c">
```

## Differences from Mux Player

- Times follow Video.js 10's format, which pads the minutes of a media 10 minutes or longer (`03:43 / 10:34` where
  Mux Player showed `3:43 / 10:34`). Only the current time switches to the time remaining; Mux Player's whole display
  was the switch.
- Tooltips read Video.js 10's labels (`Enter fullscreen`, `Seek backward 10 seconds`). Near the player's edge the
  tooltip's arrow stays in its middle instead of over the button.
- The playback rate row lists the player's rates, Video.js 10's `0.2×` to `2×` unless the player is configured
  otherwise, where Mux Player's default list was `1x` to `2x`.
- The storyboard preview is 2px shorter: Video.js 10 crops a 1px edge off each thumbnail.
- Captions do not rise above the bar while it shows.
- The Mux badge (`proudly-display-mux-badge`) is not part of the skin.
- Touch screens (a coarse pointer) get 44px targets where Mux Player kept its 30 x 26 buttons: the bar is 44px tall
  with 44px-wide buttons, the seek bar sits just above the bar and takes touches 44px up, the menu rows and the small
  centre play/pause reach 44px, and on a short player the centre moves up clear of the seek bar. The volume slider
  gives way to the device's buttons below 640px wide, the seek buttons leave between 470 and 560px, and cast and AirPlay
  leave sooner (cast below 700px, 320px in the phone layout; AirPlay between 470 and 660px). Tooltips and hover colours
  only show where a pointer hovers.
- With every control on offer Mux Player's bar ran out of the player on a narrow screen. The volume slider narrows to
  60px first, then cast leaves under 300px and between 470 and 530px, and AirPlay between 470 and 500px, when the media
  offers them.
- The live and audio layouts are separate: `@player.style/mux-player-live` covers live video; Gerwig's audio layout
  is not recreated yet.

## Open files

`dist/open/` holds the skin as files to copy into a project: `skin.html`, `skin.css`, `register.ts`, `Skin.tsx` and a
README with the paste instructions.

## Peer dependencies

`@videojs/html` for the HTML element, `@videojs/react` and `react` for the React component, all optional.

## Credits

A recreation of the default theme of [Mux Player](https://github.com/muxinc/elements) (`@mux/mux-player` 3.13.4, the
Gerwig theme, `media-theme-gerwig`), built on [Media Chrome](https://github.com/muxinc/media-chrome). The theme's
layout, colours and SVG icons, which this skin inlines, are copyright Mux, Inc. and available under the MIT License.

## License

MIT
