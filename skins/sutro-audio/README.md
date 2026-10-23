# Sutro Audio

Sutro’s audio sibling, by [Mux](https://www.mux.com) ([@muxinc](https://github.com/muxinc)): a rounded, deep-blue card with artwork, title and byline. Recreated for Video.js 10 from the [Media Chrome theme of the same name](https://media-chrome.player.style/themes/sutro-audio); see it on [skins.videojs.org](https://skins.videojs.org/skins/sutro-audio).

## Differences from the original

- Below 480px it is a stacked card (square artwork with the title over its bottom edge, the buttons, then the times around a small scrubber); from 480px one row, as the original's `md:480` breakpoint did, but as a container query. The card's height follows its content; size its container and it fills it (the old player.style page used 98px from 480px up).
- The artwork is the player's `poster` and fills its square (`object-fit: cover`); the original showed the image's top-left corner at its natural size. The title is the player's `title` / `content-title`. The byline is the React skin's `byline` prop; in the HTML markup, add `<span class="ps-byline">…</span>` after the title.
- The wide scrubber along the bottom edge responds to the pointer and shows the preview time; the original's controls row covered it.
- The rate button cycles Video.js's rates (`1`, `1.2`, `1.5`, `1.7`, `2`, then `0.2`, `0.5`, `0.7`).
- On coarse pointers buttons and the small scrubber are 44px (the original's were 40px); from 480px the card gains 20px at the bottom so the edge scrubber can reach 44px without covering the buttons.
- `--media-accent-color` colours the scrubbers' fill and thumb; `--media-secondary-color` the card (default `#17507b`); `--media-primary-color` and `--media-text-color` the icons and text; `--media-font-family`, `--media-border-radius` (16px) and `--media-object-position` as in the original.
