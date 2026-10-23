# Vidstack

The default video layout of the [Vidstack](https://vidstack.io) player (`<media-video-layout>` with the default
theme), recreated for Video.js 10 from `vidstack` 1.15.6 in its dark colour scheme by Mux
([@muxinc](https://github.com/muxinc)): a soft black gradient behind the controls, a thin time slider riding just
above a row of round, tooltip-labelled buttons, a volume slider that opens out of the mute button, a settings menu,
and a separate small-screen layout with the play button in the middle. The live-video preset recreates Vidstack's live
mode (`stream-type="live"`): the LIVE badge where the time was, grey behind the live edge and red at it. See it on
[skins.videojs.org](https://skins.videojs.org/skins/vidstack).

## Differences from Vidstack

- Times follow Video.js 10's format, which pads the minutes of a media 10 minutes or longer (`03:43 / 10:34` where
  Vidstack showed `3:43 / 10:34`).
- Settings holds Speed, Quality and Captions. Speed is a list of Video.js 10's rates rather than Vidstack's 0–2×
  slider, labelled `Normal` and `1.5x` as in Vidstack: React passes `formatRate` to the rate group, and the HTML
  markup uses `<ps-vidstack-rate-group>`, the stock rate group with that label, which `skin.ts` defines. The
  Accessibility (announcements, keyboard animations, caption styles) and Audio (boost, tracks) submenus are not there:
  Video.js 10 has no caption styling, audio gain or announcement settings to drive them. An open submenu's heading
  does not repeat the current value.
- The Google Cast and AirPlay buttons show only when Video.js 10 can cast to them; Vidstack showed Google Cast in
  every Chromium browser.
- The layout switches on the player's width only (below 677px). Vidstack also switched on a height under 380px,
  which only differs from the width rule for players that are not 16:9.
- Double tap seeks on the outer thirds of the picture and double click toggles fullscreen in the middle third;
  Vidstack used the outer fifths.
- The small layout's settings sheet opens inside the player, 8px in from its sides and bottom, and scrolls when the
  player is too short for it. Vidstack pinned the sheet to the bottom of the viewport, so on a phone it opened under
  the player, over the page.
- The small layout's volume box lines up with the end of the top row. Vidstack centred it on the mute button, which
  put its right edge past the player's.
- Where the volume cannot be set (iOS), the mute button stays and the volume box does not open. Vidstack hid both.
- On touch screens each button has a 44px square hit area, and the buttons are spaced so that the squares do not
  overlap. The circles keep Vidstack's sizes. In the small layout the top row sits 2px lower, and the time and title
  let taps through to the slider under them.
- There are no `<` and `>` speed shortcuts and no keyboard action flash in the middle of the picture.
- Captions render as the browser's own cues rather than Vidstack's caption overlay.
- Live: Vidstack keeps its time slider in live mode, filled red to the live edge; the live-video preset has no time
  slider, so the small layout's bottom row keeps the room the slider took. Settings has no Speed item, as the preset
  offers no playback rates, and there is no duration chip before the first play, which Vidstack showed even for a live
  stream.
- Theming: `--media-accent-color` (Vidstack's brand colour, `--video-brand`: the slider fills and the spinner;
  `#f5f5f5`), `--media-primary-color` (icons, text and the spinner's track; `#f5f5f5`), `--media-secondary-color` (the
  tooltips, the settings menu and the volume box; `#000` and `rgb(10 10 10)`), `--media-live-button-icon-color` and
  `--media-live-button-indicator-color` (the LIVE badge behind and at the live edge; `#8a8a8a`, `#dc2626`), plus
  `--media-font-family`, `--media-border-radius` (`6px`), `--media-object-fit` and `--media-object-position`. With no
  tokens set the skin draws Vidstack's default dark theme; the focus ring keeps Vidstack's blue whatever the accent.

## Credits

A recreation of the default video layout and theme of [Vidstack Player](https://github.com/vidstack/player) 1.15.6
(npm `vidstack`), by Rahim Alwer and the Vidstack contributors. The original stylesheets and the
[media-icons](https://github.com/vidstack/media-icons) whose SVG paths this skin inlines are available under the MIT
License.
