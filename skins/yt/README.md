# YT

An homage to the modern, ubiquitous YouTube player, by Steve Heffernan ([@heff](https://github.com/heff)). Recreated for Video.js 10 from the [Media Chrome theme of the same name](https://media-chrome.player.style/themes/yt); see it on [skins.videojs.org](https://skins.videojs.org/skins/yt).

## Differences from the original

- On coarse pointers (phones, tablets) every control is at least 44px across, where the original's 36px bar below 480px gave 36px targets: the bar is 44px tall below 480px, as is the progress strip's hit area (under the centred seek and play buttons); settings rows are 44px tall; the hover slide-out volume stays closed (the mute button stays); picture-in-picture drops out below 400px and the captions button below 350px (Subtitles/CC stays in the settings menu).
- The settings menu is placed with `position-area` instead of the `anchor()` insets Video.js sets, which in Chromium left the menu below the player on a scrolled page once its size changed.
- The desktop play/pause flash is a status indicator rather than the original's animated centred play button.
- `--media-accent-color` (the brand red), `--media-primary-color`, `--media-menu-background`, `--media-font-family`, `--media-border-radius`, `--media-object-fit` and `--media-object-position` theme it; `--media-tooltip-display: flex` shows the button tooltips the original keeps off. `--media-secondary-color` is not read: the original pinned it to `transparent`.
