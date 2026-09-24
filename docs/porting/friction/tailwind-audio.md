# tailwind-audio — friction log

Port of `themes/tailwind-audio` (Media Chrome edition 0.0.13, "Tailwind Audio" by @luwes, `audio: true`) to
`skins/tailwind-audio`, the second theme on the Video.js **audio** preset and the only one authored in Tailwind CSS.
Based on [videojs/v10#2714](https://github.com/videojs/v10/pull/2714) by cjpillsbury for the first draft of the markup
(`apps/sandbox/templates/player-style-tailwind-audio/theme.html`, `theme.css`). Date: 2026-09-24. Composite:
[`../screens/tailwind-audio.png`](../screens/tailwind-audio.png).

Severity: **blocker** (no port without it), **workaround** (ported differently), **papercut** (cost time only).

Tailwind Audio is a white bar with slate-500 icons (slate-700 on hover), a round slate-700 play button (slate-900 on
hover, a 2px ring with a 2px white offset on focus), and an 8px slate-50 scrubber with an indigo fill and a 4×16 thumb
ringed in white. Below `@md` (a 28rem = 448px container query) an 8px strip sits over an 80px bar of mute, back 10,
play, forward 10 and rate (88px total). From 448px one 64px bar with `rounded-md` and a 1px `ring-slate-700/10` adds a
hairline divider, elapsed time, an inline scrubber, total time, and moves mute to the end. No artwork, title, menus,
tooltips (`--media-tooltip-display: none`), loading indicator, or autohide.

The port measures box-for-box identical to the original at 240, 360, 447, 448, 720 and 1080px in both editions (every
button, glyph box, divider, time, range, thumb and preview box, to the tenth of a pixel), including media-chrome's
flex shrink at 448px.

## Scope

Inventory of `themes/tailwind-audio/template.html`, `tailwind.config.js`, and
`git show media-chrome:site/themes/tailwind-audio.md`:

- **Elements:** an SVG sprite (`backward`, `play`, `pause`, `forward`, `high`, `off`); strip `media-time-range` with
  `media-preview-time-display`; `media-control-bar` with seek backward/forward (`seekoffset="10"`), play, a divider
  `div`, `media-time-display`, inline `media-time-range` + preview, `media-duration-display`,
  `media-playback-rate-button`, `media-mute-button` (high/medium/low share one glyph). All in.
- **`:host([attr])` variants:** none. **`<template if>`:** none. **Breakpoints:** `@md` only (Tailwind's
  container-queries plugin: `@container (min-width: 28rem)`), in as `@container ps-tailwind-audio (inline-size >=
  448px)`.
- **`--media-*`:** `--media-accent-color` (fill and thumb, default indigo-600), `--media-secondary-color` (bar and
  thumb ring, via Tailwind's `bg-secondary` colour), `--media-primary-color: #fff` on the play button (fixed inline, so
  not themable), `--media-font-family` implicitly through media-chrome's text. The config's `primary` colour is
  commented out ("needs more sub variants"); the slate palette stays fixed. All honoured as in the original.
- **Site `themeProps`:** `className: '@[0px]:h-[88px] @md:h-[64px]'`, which equals the intrinsic heights; the README
  records it, nothing is baked in.
- **Out:** `defaultsubtitles`, `defaultduration`, `gesturesdisabled`, `hotkeys`/`nohotkeys` (player options in v10).
  Media-chrome's default hotkeys are mapped to `media-hotkey` (Space, k, m, arrows), as sutro-audio.

## Entries

1. **Tailwind → plain CSS by hand** — workaround (by policy), cheap. The template uses 61 distinct utilities (plus 24 inline `--media-*` declarations); each was
   translated to the declarations Tailwind 3.4 emits (checked against the theme's own compiled `dist/styles.css`) and
   grouped under 24 `ps-*` classes, with the utility noted in a comment beside each rule. The Tailwind CLI was not run:
   the compiled output already existed, and it is 32.8 KB of mostly unrelated classes because the theme's
   `content: ['./**/*.{html,js}']` also scanned `node_modules` (it contains `.w-[weird-and-invalid]`, `.container`,
   `.dark:lg:hover:[paint-order:markers]`). Selector renaming would have cost more than writing the ~50 rules. Result:
   `src/skin.css` 12.8 KB raw (4.0 KB gzip; comments are about a third), no `--tw-*` variables, no preflight block.
   The skin test now fails on `@tailwind`/`@apply`/`@layer`/`--tw-` and on any non-`ps-*` class selector.
2. **Preflight is part of the look** — papercut. The utilities alone do not reproduce the original: Tailwind's
   preflight (injected into the theme's shadow root) sets `border: 0 solid`, `box-sizing: border-box`, `svg { display:
   block }`, and `:host { font-family: ui-sans-serif, …; line-height: 1.5 }`. The first three are carried over; the
   host font is set on the root although only media-chrome's own text (with its own stack) is visible. Check the
   preflight when porting any Tailwind theme.
3. **Utilities override media-chrome's `:host` rules, but not everything** — papercut. A utility class on a
   media-chrome element beats that element's shadow `:host` styles, so `text-sm` becomes 14px/20px on the times while
   the font family stays media-chrome's default stack (the shorthand in `:host` is only partly overridden). `p-0`,
   `h-2`, `bg-slate-50` on the range replace its padding, 44px height and control background; the track, thumb and
   bar colours still come through `--media-range-*` properties. The measured values (walking the shadow roots) settled
   every case faster than reasoning about the cascade.
4. **A theme typo is part of the look** — deliberate parity. The inline range sets `--media-time-buffered-color`, a
   name media-chrome never reads, so it keeps the default `rgb(255 255 255 / .4)`; the strip range uses the correct
   `--media-time-range-buffered-color: rgb(0 0 0 / .02)`. The port keeps both colours.
5. **The range hit zone is taller than the range** — workaround. media-chrome's 8px range hovers across its 20px input
   (7px above, 5px below). v10 maps pointer events to the slider root's box, so the `playing-inactive` pointer 4px below
   the track showed the preview time in the original and nothing in the ports. `.ps-range::before { inset: -7px 0 -5px
   }` gives the same hit zone; the pseudo-element is part of the root, so `--media-slider-pointer` still maps across
   the track width.
6. **media-chrome buttons shrink** — papercut. At 448px the bar is 34px short: media-chrome's buttons and their
   slotted SVGs are flex-shrinkable while the times and the rate button (content, `min-width: 5ch`) are not, so seek
   buttons go to 26.7px, play to 36px, mute to 36.7px, the range to 83.5px. `flex: 0 1 auto; min-width: 0` on
   `.ps-button` and `.ps-icon`, plus `flex: 1 1 100px; min-width: 40px` on the range (media-chrome's 100px width and
   40px container minimum), reproduce it exactly. Invisible at the harness widths; found by measuring 448.
7. **Preview text antialiasing** — papercut. media-chrome's preview box is a composited layer (`will-change:
   transform`), so its text renders with grayscale antialiasing; the v10 preview rendered with subpixel colour fringes
   and diffed 0.13% on every hover. `will-change: transform` on `.ps-preview` brought `hover` to 0.00%.
8. **Sprite `<use href>` inlined** — workaround, as #2714 noted. The original draws every glyph from a sprite by id;
   the ids would repeat per React instance and the skin test forbids them, so the paths are inlined in both editions
   (the sprite's `stroke-width="1.5"` and round caps moved to `.ps-seek-icon`). The seek glyph's 32×28 slotted box
   drew the 24-unit symbol at 28px centred; a 28×28 `viewBox` SVG centred in the 32px button is the same picture.
9. **`focus:` rather than `focus-visible:` on play** — deliberate parity. The play button's ring (`focus:ring-2
   focus:ring-offset-2`) shows after a mouse click too; the port keeps `:focus`, and the extra-state capture shows the
   ring after a click and on Tab in all three panes. Other controls use `:focus-visible`, as the original.
10. **Buffered range drawn only by the ports** — papercut (harness), as sutro-audio entry 10. The strip's 2% black
    buffered tint is the only residue at 360 in `playing-inactive`/`paused-after-play`.
11. **Rate list** — known gap (sutro-audio entry 7). `data-rate` drives `::after { content: attr(data-rate) "x" }`;
    `1x` → `1.2x` verified in all three panes; the cycle past `2` differs.

## Parity (composite of 2026-09-24, pixel diff of each shot against the original, threshold 24/255)

| Width | idle / hover / volume / accent | scrub-hover | playing / inactive / paused |
| --- | --- | --- | --- |
| 360 | 0.00% (HTML and React) | 0.00% | 0.00–0.25% |
| 720 | 0.00% | 0.28% | 0.14–0.38% |
| 1080 | 0.00% | 0.19% | 0.27–0.37% |

The residue is the fill/thumb position during playback (media-chrome animates the range between `timeupdate`s; about
1px to 6px), the preview time 1px to the right in `scrub-hover` (sub-pixel placement of the v10 preview), and the
buffered tint (entry 10). HTML and React rows are identical to each other. An extra-state script
(`scratchpad/tailwind-audio/extra.mjs`) also matched muted, rate clicked, play clicked (focus ring), Tab focus, the
accent over a 5s fill, and the 447/448px breakpoint edge.

## Upstream-worthy (v10 file / primitive)

- A slider hit-zone knob (or documenting the `::before` pattern): media-chrome's `--media-time-range-hover-height` /
  `-hover-bottom` have no equivalent (`media-time-slider`, `core/ui/slider`), entry 5.
- Configurable playback rates (`dom/store/features/playback-rate.js`), again (sutro-audio entry 7).

## Known gaps hit again

- `SkinElement` not exported (friction-log #3): the HTML edition hand-rolls the shadow root again (~70 lines).
- Named icon slots become CSS (#2714): two glyphs each in play and mute, toggled by `data-paused`/`data-volume-level`.
- Sprite sheets must come across with the skin (#2714): inlined instead (entry 8).
- v10 never forces `fill` (#2714): the play glyph's white fill is set explicitly.
- Breakpoints become container queries (#2714): one, `@md` at 448px.
- Volume level on the mute button only (#2714): fine, one mute button.
- Rate button renders no text: `attr(data-rate)` again.
- Range padding/hit-zone geometry differs from media-chrome (minimal #7, reelplay): here the hit zone (entry 5).
- Buffered range unknown to media-chrome in the harness (sutro-audio #10, reelplay).

## Tailwind → CSS: data point for Tailwind-authored third-party skins

- **Effort:** small for the CSS itself; most of the port went to measuring, not to CSS. The utilities are a
  complete, exact spec (`h-20`, `px-4`, `ring-slate-700/10`), so nothing was eyeballed.
- **Hand translation beat compiling.** Running the CLI and renaming selectors would have meant fighting generated
  names (`.\@md\:h-16`), `--tw-*` indirection (`--tw-ring-offset-shadow`, `--tw-shadow-colored`), and the preflight,
  for a result that still needed per-rule scoping. For a theme with dozens of utilities, write the CSS; for hundreds,
  compile once with a tight `content` glob and a prefix, then rewrite.
- **What a translator must not miss:** the preflight (entry 2), how utilities interact with the host element's shadow
  styles (entry 3), plugin syntax (`@container`/`@md` from `@tailwindcss/container-queries`), `group-hover:`
  (becomes `.ps-x:hover .ps-y`), `focus:` vs `focus-visible:` (entry 9), `order-first` (`order: -9999`), and ring
  utilities that are really `box-shadow` stacks.
- **Theming stays thin.** Tailwind themes bake palette colours into class names; only the colours the config routed
  through CSS variables (`secondary`, `accent`) are themable, and the port keeps exactly those.

## Time sinks

- Checking whether to run the Tailwind CLI (entry 1) before deciding the compiled output was unusable as a base.
- The 448px flex shrink (entry 6) — found only because the extra-state script covered 447/448px.
- The harness dev server on a shared port disappeared mid-session (another agent's); a private `--port --strictPort`
  server fixed it.

## Positives

- The first capture already matched box-for-box at 360/720; the remaining work was the hit zone, the shrink and
  antialiasing.
- The audio preset needed nothing new: the same `ui/*` elements as sutro-audio, no controls layer, no poster.
- v10's slider preview with `overflow="clamp"` reproduced media-chrome's preview position without tuning.

## Not verified

- Dragging either scrubber (the pointer-following fill mirrors sutro-audio's).
- Hotkeys; keyboard focus on the slider thumb (the ring rule is written, not captured).
- Firefox and Safari (`:has()` in the focus rule, container queries).
- The site registration was done in the integration pass (2026-09-24), not by this port.

## Proposed best-practice additions

Merged into [best-practices.md](../best-practices.md) on 2026-09-24.

## Round 2

Date: 2026-09-24. Composite regenerated: [`../screens/tailwind-audio.png`](../screens/tailwind-audio.png).

### Tokens

| Token | Surface | Default | Original |
| --- | --- | --- | --- |
| `--media-accent-color` | Scrubber fill and thumb, both ranges (`--ps-accent`) | `rgb(79 70 229)` (indigo-600) | Same: the Tailwind `accent` colour and both ranges' inline `--media-range-bar-color` / `-thumb-background` |
| `--media-secondary-color` | Bar background (`--ps-secondary`); thumb ring (`--ps-thumb-ring`) | `#fff`; `rgb(255 255 255 / 0.9)` | Same: Tailwind `secondary` and the ranges' `--media-range-thumb-box-shadow` |
| `--media-primary-color` | Nothing | none | Nothing reachable: the config's `primary` hook is commented out, the play button pins it to `#fff` inline, and every other text or icon colour is a slate utility that overrides media-chrome's primary-colour default |
| `--media-font-family` | Times, rate, preview time | `"helvetica neue", "segoe ui", roboto, arial, sans-serif` | Same (media-chrome's text) |

The original already routed its brand colour, the indigo fill and thumb, through `--media-accent-color`, so nothing
changes in the stylesheet. The root declaration `--ps-accent: var(--media-accent-color, rgb(79 70 229))` is now
commented as the brand property, the README has a Theming table, and the test asserts the declaration. Verified: the
`accent-hover` column shows `#f5c518` wherever a fill or thumb is visible (it is 0% in an idle player). A scratch page
(`scratchpad/accent/`, `--media-accent-color: #8a2be2`, seeked to 4s) showed a purple fill and thumb, with the slate
and white surfaces unchanged.

### Template conditionals and reduced motion

- No `<template if>` branches in the original, so no scope cuts.
- Reduced motion: the original has no `motion-safe:`/`motion-reduce:` utilities or media query (only colour and
  range transitions); the port has none (parity).

### Scope cuts

None new. The controller attributes stay out, as in round 1.

### New v10 gaps

None.

