# Video.js 1

The original 2010 Video.js default skin by [Steve Heffernan](https://github.com/heff), recreated for Video.js 10 from
the Video.js 1.1.5 stylesheet by [Mux](https://www.mux.com) ([@muxinc](https://github.com/muxinc)): separate floating
aqua pills with a hard glossy split, a progress bar fused to its `03:43 / 10:35` time readout, six stepped volume bars
in place of a mute button, and a rounded big play button with a white halo, every icon traced from the original's CSS
border triangles. See it on [skins.videojs.org](https://skins.videojs.org/skins/videojs-1).

## Differences from Video.js 1.1.5

- The time readout pads minutes to two digits as the original did (`03:43`), but whole seconds are rounded down, where
  1.x rounded to the nearest second, so a duration of 10:34.6 reads `10:34` rather than `10:35`. From one hour on,
  Video.js 10 prints hours (`1:05:30`); 1.x kept counting minutes (`65:30`).
- The bar hides after Video.js 10's fixed 2s of inactivity plus a 2s delay in the stylesheet, so about 4s, as in 1.x.
- The big play button and spinner are centred on the player. The 1.x player box was 4px taller than its video (the
  inline `<video>` baseline gap), which put them 2px lower.
- Controls show a dotted focus outline for keyboard users; 1.x had no focus styles. Keyboard shortcuts (`Space`/`k`
  play, `m` mute, `f` fullscreen, arrows to seek 5s and step the volume) are new; the original had none.
- Phones and touch screens, which 1.x's skin never adapted to: on a coarse pointer the play and fullscreen pills are
  39px wide, so with the 5px gaps each owns 44px, and every pill takes taps from 14px above it down to the player's
  edge, so each tap target is 44 × 44 while the pills stay 25px tall. A tap shows the bar; while playing it hides
  about 4s after the last tap, and while paused it stays up. A double tap never zooms the page.
- Where the media's volume cannot be set (iOS), the volume pill leaves the strip rather than stay behind empty.
- On a narrow player the progress capsule keeps its room: below 340px the readout shows only the current time, and
  below 300px the volume pill leaves the strip. 1.x kept every pill at every size.
- Theming: unset, the skin paints exactly the 1.1.5 colours. `--media-accent-color` is the light end of the glossy
  gradient (`#1f3744`), `--media-secondary-color` its dark end (`#0b151a`), `--media-primary-color` the white of
  icons, text, borders, fills and lit volume bars, plus `--media-font-family`, `--media-border-radius`,
  `--media-object-fit` (`contain` for the video, `fill` for the poster) and `--media-object-position`.

## Credits

A recreation of the default skin of [Video.js](https://github.com/videojs/video.js) 1.1.5, designed by Steve
Heffernan. The skin's icons are SVG traces of the original's CSS border triangles; no artwork is copied.
