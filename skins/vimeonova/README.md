# @player.style/vimeonova

The [Vimeonova](https://player.style/skins/vimeonova) skin for [Video.js 10](https://videojs.org): a fresh take on the
classic Vimeo player design, with a big play button beside a translucent control bar, time chips that ride the progress
track, a vertical volume pill, and playback-rate, quality, and captions menus. Ported from the
[Media Chrome theme of the same name](https://media-chrome.player.style/themes/vimeonova) by @luwes.

Ships an HTML custom element and a React component that share one stylesheet.

## HTML

```html
<script type="module">
  import '@videojs/html/video/player';
  import '@player.style/vimeonova';
</script>

<video-player content-title="Big Buck Bunny">
  <vimeonova-skin>
    <video src="https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4"></video>
    <img slot="poster" src="https://image.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/thumbnail.webp" alt="" />
    <span slot="byline">Blender Foundation</span>
  </vimeonova-skin>
</video-player>
```

`<vimeonova-skin>` renders the theme in its shadow root around your media. The `poster` slot is optional; without it
the skin shows the player's poster. The title chip shows the player's `content-title`; the byline chip shows whatever
you put in the `byline` slot. Both are hidden when empty.

## React

```tsx
import { Video, VideoPlayer } from '@videojs/react/video';
import { VimeonovaSkin } from '@player.style/vimeonova/react';
import '@player.style/vimeonova/skin.css';

export function Player() {
  return (
    <VideoPlayer
      poster="https://image.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/thumbnail.webp"
      title="Big Buck Bunny"
    >
      <VimeonovaSkin byline="Blender Foundation">
        <Video src="https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4" />
      </VimeonovaSkin>
    </VideoPlayer>
  );
}
```

`VimeonovaSkin` accepts the props of the Video.js `Container` (`className`, `style`, …) plus `byline`.

## Features

- Responsive: below 384px the play button moves above the middle of the frame and the progress bar becomes a 5px strip
  on top of the control bar; from 484px the progress bar moves into the bar.
- Time chips: the current time rides the progress track; the pointer time (with a storyboard frame when the media has a
  `kind="metadata"` thumbnails track) appears while hovering it.
- Menus: playback rate always; captions and quality only when the media has text tracks or several renditions.
- Buffering: the progress track stripes itself while playback stalls.
- Keyboard: `Space`/`k` play, `m` mute, `f` fullscreen, `c` captions, `←`/`→` seek 10s.

## Customize

| Property | Default | Effect |
| --- | --- | --- |
| `--media-accent-color` | `rgb(0 186 115)` | The progress and volume fills, the play button's hover, and the title and byline text. |
| `--media-primary-color` | `rgb(253 244 255)` | Icons, button text, and the current-time chip. |
| `--media-secondary-color` | `rgb(23 35 34)` | The control bar, play button, volume pill, menus, and header chips (at 75% opacity). |
| `--media-font-family` | Helvetica Neue stack (buttons, menus); inherited (header) | All text except the Verdana time chips. |
| `--media-border-radius` | `0` | The player's corners. |
| `--media-object-fit`, `--media-object-position` | `contain`, `center` | How the media and poster fill the player. |

```html
<vimeonova-skin style="--media-accent-color: #f5c518">
```

## Peer dependencies

`@videojs/html` for the HTML edition, `@videojs/react` and `react` for the React edition, all optional.

## License

MIT
