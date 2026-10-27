# Winamp

A retro theme inspired by the classic Winamp media player, by [mave.io](https://mave.io) ([@maveio](https://github.com/maveio)). Recreated for Video.js 10 from the [Media Chrome theme of the same name](https://media-chrome.player.style/themes/winamp); see it on [skins.videojs.org](https://skins.videojs.org/skins/winamp).

## Differences from the original

- A fixed-size skin, as the original was: 275 × 264px (a 275 × 116 main window over a 275 × 148 video window), centred in whatever width it gets. It does not scale or reflow, so its transport buttons stay 23 × 18px on touch screens.
- Play, pause and stop each toggle playback, as in the original; the seek buttons skip 30 seconds; eject enters fullscreen. The play-state light and the VU meter are play buttons too.
- The shuffle button is the captions toggle and only shows when the media has text tracks. EQ, PL, repeat, balance, mono/stereo and the "192 kbps / 44 kHz" readouts are static artwork.
- The marquee reads "Video.js, it really whips the llama's ass!".
- The LCD text (the time and the marquee) is set in the fallback font on purpose: the original names `winamp` and `winamp-numbers` faces it never loads, so it always rendered in `monaco` or the platform's fallback, and this skin keeps that look rather than shipping fonts the original never showed.
- `--media-accent-color` recolours the LCD text (default `#00e201`); the rest is bitmap artwork. `--media-object-fit` and `--media-object-position` place the media and poster.
