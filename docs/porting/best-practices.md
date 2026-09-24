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
  the accent. Keep the theme's own knobs as `--ps-*` tokens. Check first what the theme's accent already fed (see
  "Accent mapping" below).
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
  `aspect-ratio: 16 / 9` on the root, `overflow: clip`, `isolation: isolate`. Exceptions: portrait-first themes
  (below), audio themes (height follows content), and fixed-size bitmap skins such as winamp (275 × 264, centred; the
  site entry sets `preview.fixedSize`).
- **Match which rows swallow taps.** Media-chrome control bars eat taps across their full width; give the port's row
  `pointer-events: auto` and keep the layer around it transparent, or a tap between controls pauses the video.
- **Flex trims text nodes.** `<media-time-separator> / </media-time-separator>` loses its spaces inside an inline-flex
  group; carry them as `margin-inline`.
- **Measure first.** A box dump of the live original's shadow roots (every box, font size, padding, colour at
  360/720/1080, plus the narrowest width of each layout) settled every port's sizes faster than reading media-chrome;
  several first drafts then matched to 0.1px. When boxes match and pixels do not, dump a pixel column: Chrome snaps
  nested fractional offsets separately (winamp's `top: -4.5px` handle paints 1px low).
- **Check what the original's layers swallow.** Probe with `elementFromPoint` and a scripted click: a full-size slotted
  layer can block media-chrome's click-to-play and idle timer (x-mas), and a theme's `z-index` can bury a control
  (sutro-audio's wide scrubber). Port the behaviour the original actually had, or the intent, and log which.
- **Copy font stacks verbatim**, including a missing generic fallback and fonts the theme names but never loads
  (reelplay, winamp, demuxed-2022): the browser default is part of the original's look.
- **Text inside an SVG glyph inherits media-chrome's bold button font**; set `font-weight: bold` on it (seek numbers).
- **Custom properties carry `em` to where they are used.** An offset such as `--media-popover-align-offset` written in
  `em` resolves against the popup's font size; express it through a px token.
- **Descendant `:first-child`/`:last-child` rules in a theme reach nested controls** (a mute button inside a wrapper);
  read their effect off the box dump and write explicit margins.
- **Reproduce media-chrome's paint order from the flat tree:** top chrome, centred layer, then the default slot in
  source order. Order the layer's children the same way and keep the bar positioned where it painted above a scrim.
- **One scale variable goes on `:where(.ps-<name>) > *`** inside the container query (and `.ps-<name>:fullscreen > *`),
  so top-layer popups inherit it too (sutro).
- **Whole control sets per breakpoint** (`<template if="breakpointsm">`): keep every control in the tree, default the
  width-gated ones to `display: none`, show them in the `@container` rule, and put the `[data-hidden]`/`[data-availability]`
  rule last with an extra attribute selector so it beats both. Key rules on control classes, not helper classes. An
  opt-in control that is also width-gated gets its `display: var(--media-x-display, none)` inside the query.
- **A per-state glyph rule must outrank the generic icon rule.** Do not give `.ps-button .ps-icon` a `display` value.
- **A theme's `--media-control-background` also paints the preview box and its arrow**; transparent means bare,
  shadowed text, and the invisible 5px arrow still adds to the offset.
- **Keep chrome up under a hovered control** when the original did not set `autohideovercontrols`: add
  `:not(:has(<controls>:hover))` to both the hidden-layer opacity and its `pointer-events: none` rule. Where the
  original only hid on `mouseleave`, use `.ps-<name>:hover` inside `@media (hover: hover)` instead (x-mas).
- **Controls outside the media element need no binding.** `mediacontroller="id"` ports by placing the controls anywhere
  inside `media-container`; v10 resolves the player through ancestry (winamp).
- **Scope the tap gesture with `data-interactive`.** `media-gesture` listens on the whole container; mark chrome that sat
  outside the original's controller `data-interactive`. Ship no `media-gesture` when the original ignored clicks.
- **Fullscreen of part of a skin:** key on `:has(.ps-fullscreen-button[data-fullscreen])` and hide what the original
  left outside its fullscreen element (`media-container` reflects no `data-fullscreen`).
- **Buffering, stream type and volume level live on other elements.** Style `:has(.ps-buffering[data-visible])` from an
  empty, `display: none` indicator; read `data-volume-level` from a hidden `MuteButton` (`tabindex="-1"`,
  `aria-hidden`) when the theme has none. Stream type has no reflection on the container: a theme's live branch
  becomes a live edition on the live-video preset (see "Live editions"), and `media-live-button` carries `data-live`
  and `data-live-edge`.
- **`backdrop-filter` buttons over live video paint a lighter band in Chromium**; check the original's `playing` shot
  before treating it as a port bug.
- **Preview text antialiasing:** media-chrome's preview box is composited; `will-change: transform` on `.ps-preview`
  reproduces its greyscale text.

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
| `--media-primary-color` | `--media-accent-color` (fallback to the old name) | same | See "Accent mapping". |
| `{{mediatitle}}`, `slot="title"` | `media-title` (from `content-title` on the player) | `Title` (from `title` on the player) | Hides when empty. No byline in the store: a `byline` slot (HTML) and prop (React). |
| `mediacontroller="id"` | any descendant of `media-container` | same | Context replaces the id link. |

## Portrait / on-demand layout

A theme whose `defaultAsset` is `portrait` (or that is meant to follow its media) keeps Media Chrome's behaviour: no
`aspect-ratio` on the root, and `height: 100%` on the root and the media. That resolves to `auto` in an unsized box (the
media's ratio sizes the player, 300×150 before metadata as in the original) and fills a sized one (host, `Container`,
or the site's `aspect-video` wrapper), letterboxing the media. Set `aspect: '9 / 16'` on the skin's harness entry so the
composite renders the portrait pattern in a 9:16 box. The site preview wrapper supplies the 16:9 box; the skin does not.

## Accent mapping: follow what the theme's accent already fed

`--ps-primary: var(--media-accent-color, var(--media-primary-color, …))` is the default, but check the theme first:

- If the theme already routes `--media-accent-color` somewhere (`--media-tertiary-color: var(--media-accent-color, …)`
  in demuxed-2022 and x-mas), follow that chain. Some themes use `--media-primary-color` for glyphs on light buttons, and
  the default recipe would turn them into the accent.
- If the theme reads the accent into a variable it never uses (reelplay, halloween, winamp, x-mas), wire the accent to
  its one strong colour (fills, candy canes, LCD text) and log it as a deliberate deviation; the original's
  `accent-hover` column will not change.
- Accent-coloured artwork that is an SVG data URI becomes a `mask` over `background: var(--media-accent-color, <default>)`;
  keep the SVG's alpha so the default renders identically (halloween).
- Tailwind themes bake palette colours into class names; only colours the config routed through variables are themable.

## Sliders

- **Keep media-chrome's range padding off the slider.** v10 maps the pointer and `--media-slider-fill` against the
  slider root's box, so the 10px gaps become `margin-inline` on the slider inside a sizing wrapper (not padding on the
  wrapper: flex shrinks by inner size). Put `.ps-range` on that wrapper, media-chrome's range box, so the harness's
  `scrub-hover` (40% across the first visible `.ps-range`) hovers the same x as the original.
- **Box geometry:** media-chrome positions preview and current-time boxes across the range's padded box; a `.ps-rail`
  extending by the old padding holds them (vimeonova, halloween). A preview box is at least the empty thumbnail's
  120px wide, which decides where it clamps (x-mas).
- **An always-on current-time chip** is a second `media-slider-preview` with `--media-slider-pointer:
  var(--media-slider-fill)`; draw its arrow as a separate element.
- **Hit zone:** media-chrome's input is `max(100%, 20px)` tall; a thin slider needs `.ps-range::before { content: "";
  position: absolute; inset: -7px 0 -5px }`. The hover highlight is `.ps-track::before` at `--media-slider-pointer`.
- **Focus is on the thumb.** Style the ring with `:is(:focus-visible, :has(:focus-visible))`. Show a thumb on `:hover`
  and `[data-dragging]`, not `[data-interactive]` (it outlives the pointer while focused).
- **Rotated ranges.** v10 reads the root's client rect, so a rotated (or scaled) slider maps correctly with
  `orientation="vertical"` and the original transform (halloween). When gradients or thumb artwork must keep their
  orientation and phase, keep the slider upright and rotate only the drawing (`rotate: -90deg` on track and thumb;
  x-mas). A rotated range's transparent border is its hover bridge: port the invisible box at `opacity: 0`.
- **Buttons shrink.** media-chrome buttons and slotted SVGs are flex-shrinkable: `flex: 0 1 auto; min-width: 0` on
  `.ps-button` and `.ps-icon`, `flex: 1 1 100px; min-width: 40px` on a time range; check the narrowest width of each
  layout, not only 360/720/1080.

## Numeric state via aria-valuenow

v10 reflects no `mediacurrenttime` or `mediavolume`, but `media-slider-thumb` (`TimeSlider.Thumb`, `VolumeSlider.Thumb`)
carries `aria-valuenow`: seconds (the same unrounded float) for time, 0–100 for volume. A theme's prefix selectors port
to the thumb (`[aria-valuenow^="1."]`); volume tenths become leading digits (`^='0.3'` → `^="3"`, with overrides for
one-digit values and `100`). It reports the pointer value during a drag; treat it as a bridge, not an API (reelplay).

## Assets and artwork

- **Inline binary assets as data-URI tokens.** Emit `--ps-img-<name>: url("data:image/png;base64,…")` into the root rule
  of `skin.css`, draw them as `background-image` on empty `.ps-icon` spans in both editions, and keep one stylesheet.
  Test each token byte for byte against the legacy `themes/<name>/assets` when present (restore them locally with
  `git archive media-chrome themes/<name> | tar x`; `themes/` is gitignored) and fail on any non-data `url()`. Inventory
  what the template actually references; themes ship dead files. winamp's 23 bitmaps (73 KB base64, 90 KB `skin.css`)
  stayed one file; a second GIF-sized asset or a font would justify a separate one.
- **SVG data URIs move unchanged** (a missing `width` decides the tile size).
- **Generate long inline SVG from the legacy template** for both editions with a throwaway script (drop Figma ids and
  `slot`s, camelCase attributes for JSX), and test every `d` and SMIL `values` list against the template and between
  editions. Suffix `<mask>`/`<clipPath>` ids with `useId()` in React; the shadow root scopes them in HTML. Inline sprite
  `<use href>` symbols the same way.
- **Keep sprite offsets verbatim.** Positive offsets on a repeating background tile; check which glyph each lands on
  before "fixing" them (winamp).
- **Measure slotted images.** An `aspect-ratio` on an unsized slotted `<img>` lays it out at its natural width; decide
  between the crop and the intent and say which (sutro-audio).

## Animations and SMIL

- **Animate what the original animated.** A theme that duplicated a range to animate its thumb (`spider-walk`,
  `candle-anim`) transformed the whole range box: wrap the v10 thumb in a box of the old range's size, set
  `transform-origin` including the old padding, and copy the keyframes, implicit end frames included. The later
  duplicate painted over the earlier one; reproduce it with `z-index`.
- **Prefix keyframe names** `ps-<name>-…`: keyframes are global in the React stylesheet and the scope test cannot see
  them.
- **Replace `<marquee>` with a linear `translateX` animation** at the original's speed (6px/85ms by default), from the
  box width to `-100%`, stopped under `prefers-reduced-motion`.
- **No rotate or scale in a menu popup's starting style.** The popup measures its pages from bounding rects at open
  time; translate only (sutro).
- **SMIL runs as-is** in both editions (each `<svg>` has its own timeline, so phase differs between panes) and ignores
  `prefers-reduced-motion`; keep parity and say so in the README.

## Audio themes

- **Harness:** `kind: 'audio'` in `apps/skin-compare/src/skins.ts` (see the README). The template root is
  `<media-container … data-preset="audio">`; register the same `@videojs/html/ui/*` modules as for video.
- **No controls layer unless the theme hid its controls.** `audioFeatures` has no controls feature and media-chrome's
  audio controller never auto-hides; lay the bar out in plain elements and expect `playing-inactive` to equal `playing`.
- **Artwork is `media-poster` / `Poster.Root` + `Poster.Image`**, filled from `<img slot="poster">` or
  `AudioPlayer poster`. Never hide it on `:not([data-visible])`: that drops when playback starts.
- **Height follows content; width drives layout.** No `aspect-ratio`; `height: 100%` on the root, the theme's
  `min-height` on a descendant inside the container query. Record the old site's `themeProps` height in the README.
- **Hide the media element:** `.ps-<name> > audio, .ps-<name> ::slotted(audio) { display: none }`.
- **Rate button text** is `::after { content: attr(data-rate) "x" }`; the rate list is v10's fixed eight.
- **`light-dark()` and `color-scheme`.** v10's audio skins get `light-dark()` from their own stylesheet, which a port
  does not load. A fixed card sets `color-scheme: dark` (or light) on its root; a theme that follows the page writes its
  tokens as `light-dark()` and sets `color-scheme: light dark`.

## Tailwind-authored themes

- **Translate by hand, from the compiled output**, for a theme with dozens of utilities: read the theme's
  `dist/styles.css` for exact declarations, note the utility beside each `ps-*` rule, and carry over the preflight
  rules that change the look (`border: 0 solid`, border-box, `svg { display: block }`, host font). For hundreds, compile
  once with a tight `content` glob and a prefix, then rewrite. Test that `@tailwind`, `@apply`, `@layer`, `--tw-` and
  non-`ps-*` class selectors never appear.
- **Utility classes on media-chrome elements beat their shadow `:host` rules**, so the utility sets the size while unset
  properties (font family) keep media-chrome's defaults; measure.
- Watch plugin syntax (`@md` container queries), `group-hover:`, `focus:` vs `focus-visible:`, `order-first`
  (`order: -9999`), and ring utilities that are `box-shadow` stacks.

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
- **Style `:hover`, not `[data-highlighted]`,** when the original only painted on hover: v10 highlights the checked item
  when a menu opens.
- **Count rendered buttons, not hidden ones, in `:has()` menu offsets.** React renders `null` for buttons the media
  cannot use, so default each term to 0 and raise it with `:has(.ps-x-button:not([hidden], [data-hidden],
  [data-availability="unavailable"], [data-availability="unsupported"]))`.
- **A captions menu** is a plain `<button commandfor>` (or `media-captions-button commandfor`) and a `media-menu` holding
  `media-captions-radio-group`; the menu pushes `hidden`/`data-availability` onto its trigger. React wraps trigger and
  popup in `CaptionsRadioGroup.Root`. `formatRate` on the HTML rate group is a class field: set it after
  `customElements.upgrade(root)`.
- **Set tooltip delay per tooltip** (`delay="0"` / `delay={0}`); the group's `delay` is shadowed by the element default.
- **Author `<media-tooltip-label>` / `Tooltip.Label`** when a theme shows no shortcut; the element then adds none. Draw
  the arrow as a `::after` on the tooltip in both editions.
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
- **Check the buffered bar before chasing track colours.** In the harness media-chrome never learns the local WebM's
  buffered range (it listens for `progress`, which fired before it attached), so a lighter unplayed track in the ports
  is expected in every theme that draws a buffer.
- **`capture.mjs` hovers the first visible match**, so themes that swap controls by width get their `scrub-hover`
  column. Themes without a mute button get no `volume-hover` column; cover volume in a per-skin script.
- **Inject text tracks for menu states:** append `<track kind="subtitles" src="data:text/vtt,…">` to the media from
  Playwright; all three panes then show the captions button and menu.
- **Headless Chromium plays no H.264** (the site's MP4 and live HLS fail there with a codecs error); not a skin bug.

## Live editions

A theme that branched on `streamtype == 'live'` ships that branch as a sibling package on the Video.js live-video
preset, named like a first-party skin: `skins/<name>-live`, `@player.style/<name>-live` (microvideo and
microvideo-live are the reference).

- **Layout:** the live package has every file an on-demand skin has (`package.json`, `README.md`, the two tsconfigs,
  `vite.config.ts`, `src/html/template.html`, `src/html/index.ts`, `src/react/index.tsx`, `tests/skin.test.ts`) except
  `src/skin.css`. Its `vite.config.ts` is `defineSkinConfig({ dir: import.meta.dirname, stylesheet: '../<name>/src/skin.css' })`
  and its HTML entry (or the host module it imports) inlines the same file: `import styles from
  '../../<name>/src/skin.css?inline'`, relative to the importing file. `build-skin` copies that stylesheet to
  `dist/skin.css` and `dist/open/skin.css`, so `@player.style/<name>-live/skin.css` is the same file as
  `@player.style/<name>/skin.css` and each package installs on its own. The build output is the ordinary `dist/html.js`,
  `dist/react.js`, `dist/types/{html,react}/`, `dist/skin.css`, `dist/open/`.
- **Names:** element `<name>-live-skin` (`NameLiveSkinElement`), component `NameLiveSkin` with `NameLiveSkinProps`.
  Root markup keeps the on-demand root, `class="media-skin ps-<name>" data-theme="<name>"`, plus
  `data-preset="live-video"`; the on-demand edition never carries that attribute, so live-only rules in the shared
  `skin.css` key on `.ps-<name>[data-preset="live-video"]`. `detectPreset` reads the attribute and the open edition
  README documents `<live-video-player>` / `LiveVideoPlayer` for it.
- **Host:** `<live-video-player>` from `@videojs/html/live-video/player`; React `LiveVideoPlayer` and `Video` from
  `@videojs/react/live-video`. Drop what the original's live branch dropped (time slider, seek buttons, seek hotkeys,
  and the play button where the original hid it) and put a `media-live-button` / `LiveButton` where it showed a live
  indicator. Give the button its own text (`<span>Live</span>`) so v10 does not inject its translated badge; style the
  dot from `data-live-edge` (red at the edge, grey behind it) and honour `--media-live-button-icon-color` /
  `--media-live-button-indicator-color` with media-chrome's defaults (`rgb(140 140 140)`, `rgb(255 0 0)`). v10 marks
  the badge `aria-disabled` at the live edge, as media-chrome did.
- **Package:** `package.json` mirrors the on-demand package's (exports `.`, `./react`, `./skin.css`, `./open/*`,
  `./package.json`; `sideEffects: ["./dist/html.js"]`; same scripts, devDependencies and peers) under the name,
  homepage (`https://player.style/skins/<name>-live`) and `repository.directory` of the live package. The root package
  lists `@player.style/<name>-live` as a dependency and `./skins/<name>-live/dist/html.js` as a side effect; its
  wildcard exports already serve `player.style/<name>-live`, `/react`, `/skin.css` and `/open/<file>`. release-please
  tracks `skins/<name>-live` like every skin.
- **Shared host code** (the shadow-root boilerplate, host-variant mirroring) is copied into the live package rather
  than imported across directories, so each package stands alone once published; a test in the live package compares
  the copy with the sibling's (header and stylesheet import aside). `createRegistration` reads only the `@videojs/html`
  imports of the entry, so keep those in `src/html/index.ts`. Keep each `template.html` and React file
  self-contained: the open edition copies them verbatim.
- **Tests and harness:** the live package's `tests/skin.test.ts` runs the parity checks against the shared stylesheet
  (`../../<name>/src/skin.css`) and the sibling's template (for the dropped controls); the harness gets an entry
  `<name>-live` with `kind: 'live-video'` (the original renders with `streamtype="live"`, the ports inside the live
  player), its `html` / `react` loaders on `skins/<name>-live/src/*` and its `css` loader on `skins/<name>/src/skin.css`.
  Its composite goes to `docs/porting/screens/<name>-live.png`. Headless Chromium plays no HLS, so the panes play the
  same WebM as the video skins; the live edge never shows and the badge stays grey in every pane.
- **DVR** (`targetlivewindow > 0`) branches are a scope cut: v10 reflects no target live window to a skin.

## Theming tokens

- Reproduce the original's `--media-primary-color`, `--media-secondary-color`, `--media-accent-color` and any
  theme-specific `--media-*` token with the same defaults; read them off `git show media-chrome:themes/<name>/template.html`.
- Declare the theme's dominant brand colour once on the root as a private property that reads
  `var(--media-accent-color, <brand default>)` (`--ps-primary: var(--media-accent-color, var(--media-primary-color, …))`
  when the original's brand colour was its primary), and use that property everywhere the brand colour paints. Setting
  `--media-accent-color` then recolours the theme even where the original never consulted it; the site's picker relies
  on this. See "Accent mapping" for themes whose accent already fed something.
- `tests/skin.test.ts` asserts the root rule declares the brand property from `--media-accent-color`.
- The README gets a "Theming" table: token, what it colours, default.

## Host variants

A theme's `:host([attr])` layout variants (microvideo's `controlbarplace` and `controlbarvertical`) become attributes on
the element and camel-cased props on the component.

- The element lists them in `observedAttributes` and mirrors them onto the inner `.ps-<name>` container as
  `data-<attr>` (`data-controlbar-place`, `data-controlbar-vertical`); React sets the same data attributes from its
  props. CSS keys on the data attributes inside the `.ps-<name>` scope, so both editions and the open edition (which
  sets the data attributes by hand; the template's header comment documents them) share one set of rules.
- Keep the original's vocabulary. `controlbarplace` was a raw `place-self` value read with `^=` / `$=` selectors; the
  port reads the mirrored attribute the same way (`[data-controlbar-place^="start"]`, `[data-controlbar-place$="end"]`)
  and adds the shorthands `top`, `center`, `bottom`.
- **A CSS-rotated v10 slider does not remap the pointer.** Media-chrome rotated a native `<input type=range>`; v10
  reads `clientX` against the root rect. A vertical variant switches the slider's `orientation` (attribute from the
  element's `attributeChangedCallback`, prop in React) and lays the fill out from the bottom instead of transforming.
- Declarations the original could not apply (`left: - var(--x)`, custom properties resolving to `- 42px`) were no-ops;
  port the effect, not the variant's rule.

## Tests

- **Clean the stylesheet before the selector checks:** strip at-rule preludes before splitting on commas (an
  `@supports (color: color-mix(in srgb, red, blue))` reads as bare tags), strip `@keyframes` blocks (`from`/`to`), and
  blank `url('data:…')` values (inline SVG markup reads as tags and external URLs).
- **Skins without SVG** compare glyph classes, artwork tokens and visible text between editions instead of `d` paths.
- **Classes that only exist in one edition** (`ps-byline-slot` on a `<slot>`, tooltip ids) are listed in the test.
