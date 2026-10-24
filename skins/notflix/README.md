# Notflix

Everything but the big red N and long bus rides to Los Gatos, by Steve Heffernan ([@heff](https://github.com/heff)).
Recreated for Video.js 10 from the [Media Chrome theme of the same name](https://media-chrome.player.style/themes/notflix);
see it on [skins.videojs.org](https://skins.videojs.org/skins/notflix).

## Differences from the original

- The title in the middle of the bar is the player's content title (`content-title` on `<video-player>`, `title` on
  `VideoPlayer`). In React, the skin's `mediaTitle` prop replaces it with any node; the HTML markup can be edited
  instead.
- On coarse pointers (phones, tablets) every control is at least 44px across, where the original's buttons were 38px
  below 576px. The progress strip and the remaining-time toggle reach 44px up, the toggle is at least 44px wide however
  short the time, and subtitle rows are 44px tall. A long title ends in an ellipsis instead of a clipped word, at every
  size.
- `--media-accent-color` (the brand red, `#ea3323`) and `--media-primary-color` (icons and text, `#fff`) colour what
  they coloured in the original; `--media-secondary-color` is not read, as the original painted nothing with it.
  `--media-font-family`, `--media-border-radius`, `--media-object-fit` and `--media-object-position` also apply.
