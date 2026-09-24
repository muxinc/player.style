# @player.style/minimal

The [Minimal](https://player.style/skins/minimal) skin for [Video.js 10](https://videojs.org): the bare-bones controls
viewers need in one rounded bar inset from the bottom edge. Ported from the
[Media Chrome theme of the same name](https://media-chrome.player.style/themes/minimal) by Mux.

Ships an HTML custom element and a React component that share one stylesheet.

## HTML

```html
<script type="module">
  import '@videojs/html/video/player';
  import '@player.style/minimal';
</script>

<video-player content-title="Big Buck Bunny">
  <minimal-skin>
    <video src="https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4"></video>
    <img slot="poster" src="https://image.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/thumbnail.webp" alt="" />
  </minimal-skin>
</video-player>
```

`<minimal-skin>` renders the theme in its shadow root around your media. The `poster` slot is optional; without it the
skin shows the player's poster. The title in the top-left corner comes from the player's `content-title` attribute and
is hidden when there is none.

## React

```tsx
import { Video, VideoPlayer } from '@videojs/react/video';
import { MinimalSkin } from '@player.style/minimal/react';
import '@player.style/minimal/skin.css';

export function Player() {
  return (
    <VideoPlayer
      title="Big Buck Bunny"
      poster="https://image.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/thumbnail.webp"
    >
      <MinimalSkin>
        <Video src="https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4" />
      </MinimalSkin>
    </VideoPlayer>
  );
}
```

`MinimalSkin` accepts the props of the Video.js `Container` (`className`, `style`, …).

## Responsive controls

The bar follows the player's width, as the original's breakpoints did:

| Player width | Controls |
| --- | --- |
| under 384px | play, time slider, mute, captions, fullscreen; a 30px bar |
| 384px and up | adds volume, AirPlay and Cast (and the opt-in seek and picture-in-picture buttons); a 38px bar |
| 576px and up | adds the elapsed time; a 46px bar |

Captions, AirPlay, Cast and volume drop out when the media or browser cannot use them.

## Customize

| Property | Default | Effect |
| --- | --- | --- |
| `--media-accent-color` | `#fff` | Icons, slider fills, and text (falls back to `--media-primary-color`). |
| `--media-text-color` | `#eee` | The elapsed time, preview time, and title. |
| `--media-secondary-color` | `#000` | The bar's surface, drawn at 75% opacity. |
| `--media-font-family` | system UI stack | All text. |
| `--media-border-radius` | `0` | The player's corners. |
| `--media-object-fit`, `--media-object-position` | `contain`, `center` | How the media and poster fill the player. |
| `--media-seek-backward-button-display`, `--media-seek-forward-button-display` | `none` | Set to `inline-flex` to show the 10-second seek buttons (384px and up). |
| `--media-pip-button-display` | `none` | Set to `inline-flex` to show the picture-in-picture button (384px and up). |

```html
<minimal-skin style="--media-accent-color: #f5c518; --media-pip-button-display: inline-flex">
```

## Not ported

The original's live layout (`streamtype == 'live'`) and its `defaultsubtitles`, `defaultduration`,
`gesturesdisabled`, `hotkeys` and `nohotkeys` attributes, which are player options in Video.js 10.

## Peer dependencies

`@videojs/html` for the HTML edition, `@videojs/react` and `react` for the React edition, all optional.

## License

MIT
