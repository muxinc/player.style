# Vimeonova

A fresh take on the classic Vimeo player design, by Wesley Luyten ([@luwes](https://github.com/luwes)). Recreated for
Video.js 10 from the [Media Chrome theme of the same name](https://media-chrome.player.style/themes/vimeonova); see it
on [skins.videojs.org](https://skins.videojs.org/skins/vimeonova).

## Differences from the original

- The title chip shows the player's content title (`content-title` on `<video-player>`, `title` on `VideoPlayer`). The
  byline chip, the original's `mediabyline`, is the React skin's `byline` prop; the HTML markup has none until a
  `<span class="ps-byline">…</span>` is written after the title.
- Playback rates read `1x`, `1.5x`, as in the original: React passes `formatRate` to the rate group, and the HTML
  markup uses `<ps-vimeonova-rate-group>`, the stock rate group with that label, which `skin.ts` defines.
- On coarse pointers (phones, tablets) the bar grows from 32px to 44px, every button is at least 44px wide, the play
  button is 44px tall, the narrow players' progress strip reaches 44px up (under the centred play button), and menu
  rows are 44px tall. The volume slide-out, which opens on hover, stays closed (iOS ignores volume; the mute button
  stays).
- The original's colour tokens keep their defaults: `--media-accent-color` (the brand green, `rgb(0 186 115)`),
  `--media-primary-color` (icons and text, `rgb(253 244 255)`) and `--media-secondary-color` (the translucent
  surfaces, `rgb(23 35 34)`), plus `--media-font-family`, `--media-border-radius`, `--media-object-fit` and
  `--media-object-position`.
