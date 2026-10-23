# Reelplay

A nostalgic media player inspired by the desktop players of a bygone era, by Dave Kiss ([@davekiss](https://github.com/davekiss)). Recreated for Video.js 10 from the [Media Chrome theme of the same name](https://media-chrome.player.style/themes/reelplay); see it on [skins.videojs.org](https://skins.videojs.org/skins/reelplay).

## Differences from the original

- From 640px up the layout is the original's. The original had no breakpoints, so in a narrower player its status bar labels wrapped on top of each other. Here container queries make room instead: below 640px every control has a 44px target, below 540px the status bar text drops to 12px, below 480px the "Theme by" credit and the volume slider drop out (the mute button stays), below 360px the bitrate label and the stop button go, and below 320px the "Powered by" credit goes. The time display always stays. On coarse pointers the 44px targets apply from 640px up too.
- The seek arrows skip 30 seconds, as in the original; the stop button pauses. The bitrate and credits in the status bar are fixed text.
- `--media-accent-color` (default `#008484`) recolours the scrubber and volume fills under the dotted pattern; the original read it into properties it never painted with. `--media-primary-color`, `--media-text-color`, `--media-border-radius`, `--media-object-fit` and `--media-object-position` theme the rest; the greys, the LCD green, the title gradient and the `monaco` fonts are the theme's own.
