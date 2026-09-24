# Porting best practices

A living list. Add to it when a port teaches something that applies to the next one.

## CSS

- **Class selectors only.** The HTML edition renders custom elements (`media-play-button`) where React renders native
  ones (`button`), so a tag selector styles one edition and not the other. `tests/skin.test.ts` fails on bare tags.
- **Reset what native elements bring.** Include a button reset (`margin: 0; padding; border: 0; background:
  transparent; color: inherit; font: inherit; appearance: none`) and `.ps-<name> [hidden] { display: none !important }`.
- **Style the media twice**: `.ps-<name> > video, .ps-<name> > audio` for React's light DOM and
  `.ps-<name> ::slotted(video), .ps-<name> ::slotted(audio)` for the HTML shadow root. Same for a slotted poster image:
  `.ps-poster-image, .ps-poster ::slotted(img)`.
- **Breakpoints are container queries.** Put `container: ps-<name> / inline-size` on the root and write
  `@container ps-<name> (inline-size >= 384px)`. The container cannot match its own queries, so set the responsive
  custom properties on a descendant (microvideo sets `--ps-control-padding` on `.ps-bar`). Media Chrome's stops were
  `sm:384 md:576 lg:768 xl:960`.
- **State is data attributes.** `data-paused`, `data-muted`, `data-volume-level="off|low|medium|high"`,
  `data-active` (captions on), `data-fullscreen`, `data-pip`, `data-cast-state="connected"`, `data-visible` and
  `data-user-active` on controls, `data-visible` on poster and buffering indicator, `data-open` on dialog parts,
  `data-pointing`, `data-dragging`, `data-interactive` on sliders, `data-hidden` and `data-availability` on buttons the
  media cannot use, `data-controls-visible` on the container. Continuous values are `--media-slider-fill`,
  `--media-slider-buffer`, `--media-slider-pointer`.
- **Accent first, theme second.** `--ps-primary: var(--media-accent-color, var(--media-primary-color, <theme value>))`
  and use `--ps-primary` everywhere the theme used its primary colour. Honour `--media-font-family`,
  `--media-border-radius`, `--media-object-fit`, `--media-object-position`; use `--media-accent-text-color` for text on
  the accent. Keep the theme's own knobs as `--ps-*` tokens.
- **Take sizes from Media Chrome, not from screenshots.** A theme mostly sets custom properties; the pixel values come
  from media-chrome's element styles (`node_modules/media-chrome/dist/media-chrome-button.js`, `media-chrome-range.js`,
  `media-time-range.js`, `media-container.js`). Control height is 24px, button padding 10px unless the theme sets
  `--media-control-padding`, range track 4px, buttons `inline-flex` with the SVG at 24px tall and auto width.
- **A theme's invalid CSS is part of its look.** Media Chrome silently drops declarations such as
  `padding-left: 5px 5px` (a two-value padding fed to a one-value property) or `left: - var(--x)`. Port the effect
  (no gap, no offset), not the declaration.
- **One glyph per state.** Every SVG is in the DOM; `display: none` picks by data attribute
  (`.ps-play-button:not([data-paused]) .ps-icon-play`). Named `slot="play"`-style icons do not exist in v10.
- **Hide what the media cannot do.** `[data-hidden], [data-availability="unavailable"], [data-availability="unsupported"]`
  → `display: none`, matching Media Chrome's `media*unavailable` rules. Keep opt-in controls (`display: var(--media-x-display, none)`)
  after the generic button rule so the hidden rule still wins on specificity.
- **Fixed aspect ratio.** Media Chrome sizes the box from the media; the v10 packaged skins and this catalogue use
  `aspect-ratio: 16 / 9` on the root, `overflow: clip`, `isolation: isolate`.

## Element mapping (Media Chrome → Video.js 10)

| Media Chrome | HTML | React | Notes |
| --- | --- | --- | --- |
| `<media-theme-x>` + `<media-controller>` | `<video-player>` + `<media-container class="media-skin ps-x">` | `VideoPlayer` + `Container` | The skin element wraps the container in its shadow root. |
| `<slot name="media">` | default `<slot>` | `children` | Media is a plain child. |
| `<slot name="poster">` | `<media-poster><slot name="poster"><img></slot></media-poster>` | `Poster.Root` + `Poster.Image`, URL on `VideoPlayer poster` | A slotted `<img src>` is left alone; an empty one is filled from the player. |
| `media-control-bar` | `media-controls` (display: contents) + `media-controls-content` | `Controls.Root` (no element) + `Controls.Content` | `data-visible` drives auto-hide; both stacks hide only while playing. |
| `media-play-button` etc. | same tags | `PlayButton` etc. | No default icons or styles in v10; supply SVGs. |
| `media-seek-backward-button` / `-forward-` | `media-seek-button seconds="-10"` / `"10"` | `SeekButton seconds={-10}` | One element, signed seconds. |
| `media-mute-button` + `media-volume-range` | `media-mute-button` + `media-volume-slider` › `media-slider-track` › `media-slider-fill` | `MuteButton` + `VolumeSlider.Root/Track/Fill` | Volume level lives on the mute button. |
| `media-time-range` | `media-time-slider` › `media-slider-track` › `media-slider-buffer` + `media-slider-fill`, `media-slider-preview` › `media-slider-thumbnail` + `media-slider-value type="pointer"` | `TimeSlider.Root/Track/Buffer/Fill/Preview/Value`, `Slider.Thumbnail.Root/Image` | Add `media-slider-thumb` only if the theme shows one. |
| `media-loading-indicator` | `media-buffering-indicator` | `BufferingIndicator` | Delay is 500ms in both. |
| `media-error-dialog` | `media-error-dialog` › `media-dialog-backdrop`, `media-dialog-popup` › `-title`, `-description`, `-close` | `ErrorDialog.Root/Backdrop/Popup/Title/Description/Close` | React root renders nothing; put the classes on backdrop and popup. |
| gestures, `hotkeys` | `media-gesture`, `media-hotkey keys action value` | `Gesture`, `Hotkey` | Actions: `togglePaused`, `toggleMuted`, `toggleFullscreen`, `toggleSubtitles`, `togglePictureInPicture`, `seekStep`, `volumeStep`. |
| `[breakpointsm]` | `@container ps-x (inline-size >= 384px)` | same | See above. |
| `mediapaused`, `mediavolumelevel`, … | `data-paused`, `data-volume-level`, … | same | Numbers such as `mediacurrenttime` are not reflected. |
| `--media-primary-color` | `--media-accent-color` (fallback to the old name) | same | |

## Icons

Inline the theme's SVGs in both editions; v10 buttons render nothing by themselves. Give each glyph a class
(`ps-icon ps-icon-pause`) and toggle with CSS. Set `fill` on `.ps-icon` explicitly: Media Chrome forced `fill` onto
slotted artwork, v10 leaves it alone. `<media-icon name>` / `@videojs/react/icons` exist, but a theme's own artwork is
what makes it look like itself, and the two icon sets rarely match glyph for glyph.

## Poster and slots

Only a shadow-DOM element can honour a named slot, which is why the HTML edition is one (`SkinElement` is not exported
in rc.2, so the element attaches its own shadow root, adopts one shared `CSSStyleSheet`, and clones a `<template>`).
The React edition takes the poster URL from `VideoPlayer` and renders `Poster.Root` + `Poster.Image`.

## Keeping HTML and React in sync

- Same primitives in the same order, same class names, same SVG paths. The skin's test compares both files.
- Attributes and props: `seconds="-10"` ↔ `seconds={-10}`, `overflow="clamp"` ↔ `overflow="clamp"`, `type="pointer"` ↔
  `type="pointer"`, `value="0.1"` ↔ `value={0.1}`.
- Classes that only exist in one edition (`ps-controls` on `media-controls`, `ps-dialog` on `media-error-dialog`) are
  listed in the test so the diff stays intentional.
- The HTML entry registers exactly the `@videojs/html/ui/*` modules the template uses; the test checks the list.

## Harness

- Media Chrome and `@videojs/html` register eleven of the same tag names; the harness keeps every stack in its own
  iframe, and the site never loads Media Chrome.
- The panes import the skins' sources; `resolve.dedupe` keeps one copy of React and `@videojs/*` whichever package the
  import came from. pnpm already dedupes `@videojs/react` between `site/`, `skins/*`, and `apps/*`
  (check with `readlink -f <pkg>/node_modules/@videojs/react` if a React context ever goes missing).
- Headless Chromium plays WebM only; the generated test pattern in `apps/skin-compare/public/media` keeps composites
  small and deterministic.
