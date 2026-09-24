# Porting best practices

A living list. Add to it when a port teaches something that applies to the next one.

## CSS

- **Class selectors only.** The HTML edition renders custom elements (`media-play-button`) where React renders native
  ones (`button`), so a tag selector styles one edition and not the other. `tests/skin.test.ts` fails on bare tags.
- **Scope every rule under the root.** The React edition's stylesheet is global, and the gallery loads several skins
  on one page, so a bare `.ps-button` from one skin restyles every other skin's buttons. Write `:where(.ps-<name>) .ps-x`
  (no added specificity) or start the selector at `.ps-<name>`; `tests/skin.test.ts` fails on anything else.
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
- **Media-chrome buttons are 14px.** Their own `font` shorthand resets the size, so a theme's `em` paddings and
  `--media-control-height: 1.2em` resolve against 14px (or the theme's `[role=button]` size), not the root size. A theme
  rule that targets `media-controller` inside a container query never matches (instaplay).
- **Measure when the stylesheet is ambiguous.** Walk the live original's shadow roots and log each box, font size,
  padding, and colour at 360/720/1080; it settles em-vs-px questions faster than reading media-chrome (instaplay).
- **A theme's invalid CSS is part of its look.** Media Chrome silently drops declarations such as
  `padding-left: 5px 5px` (a two-value padding fed to a one-value property) or `left: - var(--x)`. Port the effect
  (no gap, no offset), not the declaration.
- **One glyph per state.** Every SVG is in the DOM; `display: none` picks by data attribute
  (`.ps-play-button:not([data-paused]) .ps-icon-play`). Named `slot="play"`-style icons do not exist in v10.
- **Hide what the media cannot do.** `[data-hidden], [data-availability="unavailable"], [data-availability="unsupported"]`
  → `display: none`, matching Media Chrome's `media*unavailable` rules. Keep opt-in controls (`display: var(--media-x-display, none)`)
  after the generic button rule so the hidden rule still wins on specificity.
- **Fixed aspect ratio.** Media Chrome sizes the box from the media; the v10 packaged skins and this catalogue use
  `aspect-ratio: 16 / 9` on the root, `overflow: clip`, `isolation: isolate`. Exception: portrait-first themes (below).
- **Match which rows swallow taps.** Media-chrome control bars eat taps across their full width; give the port's row
  `pointer-events: auto` and keep the layer around it transparent, or a tap between controls pauses the video.
- **Keep commas out of at-rule preludes.** The skin test's `selectors()` splits on commas before dropping `@` preludes,
  so `@supports (color: color-mix(in srgb, red, blue))` fails as bare tags. Drop the `@supports` or fix the helper.
- **Flex trims text nodes.** `<media-time-separator> / </media-time-separator>` loses its spaces inside an inline-flex
  group; carry them as `margin-inline`.

## Element mapping (Media Chrome → Video.js 10)

| Media Chrome | HTML | React | Notes |
| --- | --- | --- | --- |
| `<media-theme-x>` + `<media-controller>` | `<video-player>` + `<media-container class="media-skin ps-x">` | `VideoPlayer` + `Container` | The skin element wraps the container in its shadow root. |
| `<slot name="media">` | default `<slot>` | `children` | Media is a plain child. |
| `<slot name="poster">` | `<media-poster><slot name="poster"><img></slot></media-poster>` | `Poster.Root` + `Poster.Image`, URL on `VideoPlayer poster` | A slotted `<img src>` is left alone; an empty one is filled from the player. |
| `media-control-bar` | `media-controls` (display: contents) + `media-controls-content` | `Controls.Root` (no element) + `Controls.Content` | `data-visible` drives auto-hide; both stacks hide only while playing. No rule on `data-visible` = `noautohide`. |
| `media-play-button` etc. | same tags | `PlayButton` etc. | No default icons or styles in v10; supply SVGs. |
| `media-seek-backward-button` / `-forward-` | `media-seek-button seconds="-10"` / `"10"` | `SeekButton seconds={-10}` | One element, signed seconds. |
| `media-mute-button` + `media-volume-range` | `media-mute-button` + `media-volume-slider` › `media-slider-track` › `media-slider-fill` | `MuteButton` + `VolumeSlider.Root/Track/Fill` | Volume level lives on the mute button. |
| `media-time-range` | `media-time-slider` › `media-slider-track` › `media-slider-buffer` + `media-slider-fill`, `media-slider-preview` › `media-slider-thumbnail` + `media-slider-value type="pointer"` | `TimeSlider.Root/Track/Buffer/Fill/Preview/Value`, `Slider.Thumbnail.Root/Image` | Add `media-slider-thumb` only if the theme shows one. |
| `media-loading-indicator` | `media-buffering-indicator` | `BufferingIndicator` | Delay is 500ms in both. |
| `media-error-dialog` | `media-error-dialog` › `media-dialog-backdrop`, `media-dialog-popup` › `-title`, `-description`, `-close` | `ErrorDialog.Root/Backdrop/Popup/Title/Description/Close` | React root renders nothing; put the classes on backdrop and popup. |
| `media-settings-menu` + `media-settings-menu-item` | `media-menu` › `media-menu-content` › `media-menu-item` / `media-menu-radio-item`; submenus via `commandfor` | `Menu.Root/Trigger/Popup/Content/Item/RadioItem/ItemIndicator` | Rate, quality, captions: `media-*-radio-group` with a `<template>`; React `renderItem`. See below. |
| `media-tooltip` / `tooltipplacement` | `media-tooltip trigger="id" side` + `media-tooltip-group` | `Tooltip.Provider/Root/Trigger/Popup/Label/Shortcut` | See below. |
| centred `media-play-button` flash on `mediapaused` | `media-status-indicator` (`data-status`, `close-delay`) | `StatusIndicator.Root` | Fires on hotkey and gesture only, not on button clicks or API calls. |
| chapters in `media-time-range` | `media-time-slider-chapters` (track `<template>`) + `media-time-slider-chapter-title` | `TimeSlider.Chapters` + `TimeSlider.ChapterTitle` | `--media-slider-chapter-start/end` inline; `clip-path: inset()` segments; `data-highlighted` on hover. |
| gestures, `hotkeys` | `media-gesture`, `media-hotkey keys action value` | `Gesture`, `Hotkey` | Actions: `togglePaused`, `toggleMuted`, `toggleFullscreen`, `toggleSubtitles`, `togglePictureInPicture`, `seekStep`, `volumeStep`. |
| `[breakpointsm]` | `@container ps-x (inline-size >= 384px)` | same | See above. |
| `mediapaused`, `mediavolumelevel`, … | `data-paused`, `data-volume-level`, … | same | Numbers such as `mediacurrenttime` are not reflected. |
| `--media-primary-color` | `--media-accent-color` (fallback to the old name) | same | |

## Portrait / on-demand layout

A theme whose `defaultAsset` is `portrait` (or that is meant to follow its media) keeps Media Chrome's behaviour: no
`aspect-ratio` on the root, and `height: 100%` on the root and the media. That resolves to `auto` in an unsized box (the
media's ratio sizes the player, 300×150 before metadata as in the original) and fills a sized one (host, `Container`,
or the site's `aspect-video` wrapper), letterboxing the media. Set `aspect: '9 / 16'` on the skin's harness entry so the
composite renders the portrait pattern in a 9:16 box. The site preview wrapper supplies the 16:9 box; the skin does not.

## Menus, popovers, tooltips

- **Popups inherit `pointer-events`.** A `media-menu` or `media-popover` in the click-through controls layer renders in
  the top layer but still inherits `pointer-events: none`, so clicks fall through and it closes as `outside-click`. Give
  each one `pointer-events: auto` (tooltips stay `none`).
- **Menu items size with `min-height`, never `height`.** The popup measures each page with `height: auto` on its items.
- **Offsets are `--media-popover-side-offset` / `--media-popover-align-offset`** on the menu element in rc.2 (the docs
  say `--media-menu-side-offset`); tooltips read `--media-tooltip-*`. The align offset is added outside the boundary
  clamp, so drop terms for hidden buttons (`:has(.ps-pip-button[data-hidden])`).
- **`ui/tooltip` needs `ui/tooltip-label` and `ui/tooltip-shortcut`** imported too; the element creates both at runtime,
  so the parity test cannot see them. Read the harness's console-error report after every capture.
- **Link HTML tooltips by id.** Give each button a prefixed id (`yt-play`) and use `<media-tooltip trigger="yt-play">`;
  keep `commandfor` for menus and popovers (on a media button it toggles the tooltip on click), and do not rely on the
  next-sibling link where it would break a `mute + slider` adjacency. React needs no ids
  (`Tooltip.Trigger render={<PlayButton />}`); exclude the ids from the test's `ps-*` class scan. No arrow part in HTML.
- **Compose triggers with `render`.** `Tooltip.Trigger render={<Menu.Trigger />}` merges props; `aria-expanded` on the
  trigger styles an open menu in both editions.
- **Menus need their own states.** The eight harness states never open a menu, submenu, or tooltip; write a per-skin
  Playwright script for those.

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
  small and deterministic. Portrait (`aspect`) and audio (`kind: 'audio'`) skins get their own media automatically.
- The `accent-hover` column is an idle player, so a fill or thumb at 0% hides the accent; check it with a scrubbed or
  playing capture as well.
