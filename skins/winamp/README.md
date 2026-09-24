# @player.style/winamp

Placeholder for the Video.js 10 port of the [winamp Media Chrome theme](https://media-chrome.player.style/themes/winamp)
(`themes/winamp`). Targets the `video` preset (`<video-player>` / `VideoPlayer`). Follow [docs/porting/README.md](../../docs/porting/README.md) and replace
this file with the usage README once the port lands.

## Note for the port

The theme's docs page flags it `audio: true`, but its template renders a video window (`<slot name="media">` inside a
black `media-controller` with a poster slot and a fullscreen button) above the Winamp main panel, and #2714 ported it
as video. Port it on the video preset at the original's fixed 275px width.
