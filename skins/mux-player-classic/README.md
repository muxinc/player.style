# @player.style/mux-player-classic

The [Mux Player Classic](https://player.style/skins/mux-player-classic) skin for [Video.js 10](https://videojs.org):
Mux Player's original theme, the default before Gerwig, recreated from the `classic` theme that ships in
`@mux/mux-player` 3.13.4. A translucent black control bar under a thin full-width time range, the storyboard preview
above the pointer, a 100px volume range, a `1x` rate button, the captions menu, and outlined play and seek glyphs in
the middle of the picture.

Ships an HTML custom element and a React component that share one stylesheet.

## HTML

```html
<script type="module">
  import '@videojs/html/video/player';
  import '@player.style/mux-player-classic/html';
</script>

<video-player>
  <mux-player-classic-skin>
    <video src="https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4"></video>
    <img slot="poster" src="https://image.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/thumbnail.webp" alt="" />
  </mux-player-classic-skin>
</video-player>
```

`<mux-player-classic-skin>` renders the skin in its shadow root around your media. The `poster` slot is optional;
without it the skin shows the player's poster. Set `content-title` on `<video-player>` to show the title.

## React

```tsx
import { Video, VideoPlayer } from '@videojs/react/video';
import { MuxPlayerClassicSkin } from '@player.style/mux-player-classic/react';
import '@player.style/mux-player-classic/skin.css';

export function Player() {
  return (
    <VideoPlayer poster="https://image.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/thumbnail.webp">
      <MuxPlayerClassicSkin>
        <Video src="https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4" />
      </MuxPlayerClassicSkin>
    </VideoPlayer>
  );
}
```

`MuxPlayerClassicSkin` accepts the props of the Video.js `Container` (`className`, `style`, …). Pass `title` to
`VideoPlayer` to show the title.

## Features

- The theme's three layouts, by player width: under 300px the bar keeps play, mute, captions and fullscreen; from
  300px the title, the centre seek / play / seek glyphs and the full bar (time, volume, quality, rate, audio, captions,
  AirPlay, cast, picture-in-picture, fullscreen); from 700px the seek buttons move from the centre into the bar. A bar
  short of room narrows its glyphs and its volume range, as the theme's did, so no control leaves the player.
- Time range: a 4px track on the bar's top edge with the buffered range and no visible thumb, and the storyboard
  thumbnail over the pointer time. Add a `<track kind="metadata" label="thumbnails">` (Mux's `storyboard.vtt`) for the
  thumbnail.
- Menus for captions, quality and audio tracks, each shown only when the media offers a choice.
- The loading arc 0.5s into a stall, with the centre glyphs stepping aside; the title's gradient only when there is a
  title.
- The controls fade while playing and stay up while the pointer rests on the bar or a menu is open.
- Keyboard: `Space`/`k` play, `m` mute, `f` fullscreen, `c` captions, `p` picture-in-picture, `←`/`j` and `→`/`l`
  seek 10s, `↑`/`↓` volume, `<`/`>` speed. Click the picture to play or pause.

## Theming

Set these custom properties on `<mux-player-classic-skin>` (or on `MuxPlayerClassicSkin` through `style`/`className`).

| Token | What it colours | Default |
| --- | --- | --- |
| `--media-primary-color` | Icons, and the text (time, rate, title, menus, preview time). | Icons `#fff`, text `rgb(238 238 238)` |
| `--media-secondary-color` | The control bar, the menus, the preview time and thumbnail backing. | `rgb(0 0 0 / 0.75)` |
| `--media-accent-color` | The time and volume levels and the volume thumb. | `--media-primary-color`, else `#fff` |
| `--media-font-family` | All text. | `"helvetica neue", "segoe ui", roboto, arial, sans-serif` |
| `--media-border-radius` | The player's corners. | `0` |
| `--media-object-fit`, `--media-object-position` | How the media and poster fill the player. | `contain`, `center` |

With no tokens set the skin draws the classic theme's colours exactly. The theme painted its levels with the primary
colour, so the accent falls back to it.

```html
<mux-player-classic-skin style="--media-accent-color: #fa50b5">
```

## Differences from Mux Player's classic theme

- Times follow Video.js 10's format, which pads the minutes of a media 10 minutes or longer (`03:43 / 10:34` where the
  theme showed `3:43 / 10:34`); the preview time likewise.
- The rate button cycles through the player's rates (Video.js 10's default list starts at 0.2x); the theme cycled
  `1 1.2 1.5 1.7 2`. `<` and `>` step through the same list rather than by 0.25.
- With a single caption track the captions button toggles captions; the theme always opened its menu. The CC badge
  follows every track in the captions menu, where the theme showed it for captions-kind tracks only.
- Native captions rise above the bar while the controls show in the React component only; the HTML element cannot
  style a slotted video's text track container.
- Menus fade in and out; the theme also slid them 2px and scaled them from 99%.
- With every control on offer the theme kept them all and squeezed their glyphs to a few pixels on a phone. The skin
  drops the least important ones instead, when the media offers them: cast under 460px wide, AirPlay under 430px, audio
  under 400px and quality under 370px. The live bar, which has no time or rate, drops cast under 360px and AirPlay
  under 330px, and keeps the rest.

## Open files

`dist/open/` holds the skin as files to copy into a project: `skin.html`, `skin.css`, `register.ts`, `Skin.tsx` and a
README with the paste instructions.

## Peer dependencies

`@videojs/html` for the HTML element, `@videojs/react` and `react` for the React component, all optional.

## Credits

A recreation of the `classic` theme of [Mux Player](https://github.com/muxinc/elements/tree/main/packages/mux-player)
as published in `@mux/mux-player` 3.13.4 (`@mux/mux-player/themes/classic`), the look Mux Player 1.x shipped by
default. The theme's template and its icons, whose SVG paths this skin inlines, together with the media-chrome
defaults it builds on (the seek and loading glyphs, the menu check mark and CC badge), are copyright Mux, Inc. and
available under the MIT License.

## License

MIT
