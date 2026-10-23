# Sutro

Mux's sleek, modern theme, lovingly named after our favourite SF TV antenna, which is neither sleek nor modern, by
[Mux](https://www.mux.com) ([@muxinc](https://github.com/muxinc)). Recreated for Video.js 10 from the
[Media Chrome theme of the same name](https://media-chrome.player.style/themes/sutro); see it on
[skins.videojs.org](https://skins.videojs.org/skins/sutro).

## Differences from the original

- On coarse pointers (phones, tablets) every control is at least 44px across, where the original's buttons were 36px:
  buttons keep their drawn size but take a 44px box, the progress range is 44px tall, and menu rows are 44px tall. The
  volume pop-out, which opens on hover, stays closed (iOS ignores volume; the mute button stays). Below 360px the bar
  sits 8px from the edges so the progress range keeps room.
- The settings menu is placed with `position-area` instead of the `anchor()` insets Video.js sets: in Chromium, on any
  scrolled page, those left a submenu as far below the player as the page was scrolled.
- The original's colour tokens keep their defaults: `--media-accent-color` (progress and volume fills, `#fff`),
  `--media-primary-color` (icons and text, `#fff`) and `--media-secondary-color` (hovered button background,
  `transparent`), plus `--media-menu-background`, `--media-font-family`, `--media-border-radius`,
  `--media-object-fit` and `--media-object-position`.
