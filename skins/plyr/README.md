# Plyr

The default look of the [Plyr](https://github.com/sampotts/plyr) player, recreated for Video.js 10 from Plyr 3.8.4's
stylesheet and icon sprite by Mux ([@muxinc](https://github.com/muxinc)): a black gradient under a row of white icons,
round blue-filled progress and volume sliders with white thumbs, the white seek-time tooltip, the blue circular play
button in the middle, and the translucent white settings menu. See it on
[skins.videojs.org](https://skins.videojs.org/skins/plyr).

## Differences from Plyr

- Plyr inherits the page's font; the skin pins a system sans-serif stack so it looks the same on any page. Set
  `--media-font-family: inherit` to follow the page as Plyr did.
- The time shows the duration until playback starts, then the time left (`-06:51`), but it cannot be clicked to switch
  between remaining and elapsed time: Video.js 10's toggleable time matches neither of Plyr's `invertTime` modes.
  Video.js 10 pads minutes only for media of 10 minutes or more, so a short clip reads `-0:51` where Plyr showed
  `-00:51`.
- Speed labels read `Normal` and `1.5×`, as in Plyr: React passes `formatRate` to the rate group, and the HTML markup
  uses `<ps-plyr-rate-group>`, the stock rate group with that label, which `skin.ts` defines. The choices are Video.js
  10's fixed `0.2×`–`2×` set; Plyr offered `0.5`–`4`. The quality page lists Video.js 10's renditions with an `Auto`
  choice, and the captions page says `Off` where Plyr said `Disabled`.
- A settings page taller than the player scrolls inside it; Plyr let the menu spill out over the page. The menu opens
  at its full size and tweens only between pages.
- Plyr kept every control at every width. The skin follows the player's width and drops optional controls as it
  narrows so the progress bar keeps room: AirPlay under 540px, the volume range under 480px, picture-in-picture under
  400px, the captions button under 340px (its choices stay in the settings menu) and the time under 280px.
- On touch screens (`pointer: coarse`) the volume range is left out, as Plyr left it out on iOS; every control gets a
  44px hit area while keeping its 32px look; the optional controls give way sooner; buttons light up only on hover with
  a mouse; and a tap on the picture brings the controls back without pausing.
- As in Plyr there is no spinner: 250ms into a stall the buffer bar turns to moving stripes. They show while playback
  stalls, not during seeks while paused, and the control bar does not force itself up while loading.
- Captions are the browser's own rendering of the text track; Plyr drew its own caption boxes and lifted them above the
  bar. The `l` (loop) shortcut and Plyr's full-window fallback when fullscreen is unavailable are not included.
- `--media-accent-color` is Plyr's `--plyr-color-main` (`hsl(198deg 100% 50%)`), `--media-primary-color` its
  `--plyr-video-control-color` (`#fff`) and `--media-secondary-color` the controls gradient's black, plus
  `--media-font-family`, `--media-border-radius`, `--media-object-fit` and `--media-object-position`. The tooltip and
  menu surfaces keep Plyr's colours as `--ps-tooltip-background`, `--ps-tooltip-color`, `--ps-menu-background` and
  `--ps-menu-color`.

## Credits

The original stylesheet and the Plyr icon sprite, whose SVG paths this skin inlines, are copyright Sam Potts and
available under the MIT License.
