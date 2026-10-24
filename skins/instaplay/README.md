# Instaplay

A mobile-first theme inspired by the playback experiences of popular social media apps, by [Mux](https://www.mux.com) ([@muxinc](https://github.com/muxinc)). Recreated for Video.js 10 from the [Media Chrome theme of the same name](https://media-chrome.player.style/themes/instaplay); see it on [skins.videojs.org](https://skins.videojs.org/skins/instaplay).

## Differences from the original

- A tap on the video pauses and resumes playback on touch screens too; in the original only a mouse click did, so a phone had no way to pause.
- On coarse pointers the round buttons reach 44px across around their circle and the scrubber reaches 44px up from the bottom edge (under the mute button), drawn as before.
- The player takes the shape of its media, so a portrait video gives a portrait player. To reserve the box before the media loads, or to fit a fixed frame, give the skin's root a size (`aspect-ratio: 9 / 16; max-height: 80vh`, say); the media then letterboxes inside it.
- `--media-accent-color` (the scrubber's progress), `--media-primary-color`, `--media-secondary-color` (the round buttons), `--media-text-color`, `--media-font-family`, `--media-border-radius`, `--media-object-fit` and `--media-object-position` theme it, as in the Media Chrome theme.
