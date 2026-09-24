# @player.style/essentials-live

The [Essentials](https://player.style/skins/essentials) skin for live video on [Video.js 10](https://videojs.org),
on the live-video preset. The classic player.style [Minimal theme](https://media-chrome.player.style/themes/minimal)
switched to this layout on `streamtype="live"`: no play button, seek buttons or time slider; a Live badge and the
elapsed time on the left of the bar, the volume, captions, AirPlay, Cast, (opt-in) picture-in-picture and fullscreen
controls on the right.

Ships an HTML custom element and a React component. The stylesheet is
[`@player.style/essentials`](../essentials/README.md)'s: `@player.style/essentials-live/skin.css` is a copy of the
same file, so both skins can share one page and one stylesheet.

## HTML

```html
<script type="module">
  import '@videojs/html/live-video/player';
  import '@player.style/essentials-live/html';
</script>

<live-video-player content-title="Live from the studio">
  <essentials-live-skin>
    <video src="https://stream.mux.com/{PLAYBACK_ID}.m3u8"></video>
  </essentials-live-skin>
</live-video-player>
```

`<essentials-live-skin>` renders the theme in its shadow root around your media. The `poster` slot is optional; without
it the skin shows the player's poster. The title in the top-left corner comes from the player's `content-title`
attribute and is hidden when there is none.

## React

```tsx
import { LiveVideoPlayer, Video } from '@videojs/react/live-video';
import { EssentialsLiveSkin } from '@player.style/essentials-live/react';
import '@player.style/essentials-live/skin.css';

export function LivePlayer() {
  return (
    <LiveVideoPlayer title="Live from the studio">
      <EssentialsLiveSkin>
        <Video src="https://stream.mux.com/{PLAYBACK_ID}.m3u8" />
      </EssentialsLiveSkin>
    </LiveVideoPlayer>
  );
}
```

`EssentialsLiveSkin` accepts the props of the Video.js `Container` (`className`, `style`, …).

## The bar

The badge's dot is grey until playback reaches the live edge, then red; pressing it seeks to the live edge. Tapping
the video and the `Space` / `k` hotkeys toggle playback, as the original's gestures did without a play button.

| Player width | Controls |
| --- | --- |
| under 384px | Live badge; mute, volume, captions, AirPlay, Cast, fullscreen (and the opt-in picture-in-picture button); a 30px bar |
| 384px and up | adds the elapsed time next to the badge; a 38px bar |
| 576px and up | a 46px bar |

Captions, AirPlay, Cast and volume drop out when the media or browser cannot use them.

## Theming

Set these on the skin element or component (or any ancestor). They are the on-demand skin's tokens plus the two the
Live badge reads.

| Token | What it colours | Default |
| --- | --- | --- |
| `--media-accent-color` | The brand colour: icons, slider fills, the dialog button, and (through `--media-text-color`'s fallback) the text. Overrides `--media-primary-color`. | `#fff` |
| `--media-primary-color` | The same surfaces, as the original theme named them. | `#fff` |
| `--media-secondary-color` | The bar's surface, drawn at 75% opacity. | `#000` |
| `--media-text-color` | The Live badge text, elapsed time and title. | `#eee` |
| `--media-live-button-icon-color` | The badge's square behind the live edge. | `rgb(140 140 140)` |
| `--media-live-button-indicator-color` | The badge's square at the live edge. | `rgb(255 0 0)` |
| `--media-icon-color` | The button glyphs and spinner alone. | the brand colour |
| `--media-range-bar-color` | The volume fill alone. | the brand colour |
| `--media-range-track-background` | The volume track. | `rgb(255 255 255 / 0.5)` |
| `--media-accent-text-color` | Text on the dialog button. | `#000` |
| `--media-font-family` | All text. | system UI stack |
| `--media-border-radius` | The player's corners. | `0` |
| `--media-object-fit`, `--media-object-position` | How the media and poster fill the player. | `contain`, `center` |
| `--media-pip-button-display` | Set to `inline-flex` to show the picture-in-picture button. | `none` |

```html
<essentials-live-skin style="--media-accent-color: #f5c518; --media-pip-button-display: inline-flex">
```

Motion: the bar fades over 0.25s / 1s and the buffering spinner turns, as in the original, which had no
`prefers-reduced-motion` rules either.

## Not ported

The original's DVR layout (`targetlivewindow > 0`: the Live badge next to the full seek controls and time range).
Video.js 10 exposes no target live window to a skin. The `defaultsubtitles`, `defaultduration`, `gesturesdisabled`,
`hotkeys` and `nohotkeys` attributes are player options in Video.js 10.

## Open files

`dist/open/` holds the skin as files to copy into a project: `skin.html`, `skin.css`, `register.ts`, `Skin.tsx` and a
README with the paste instructions.

## Peer dependencies

`@videojs/html` for the HTML element, `@videojs/react` and `react` for the React component, all optional.

## License

MIT
