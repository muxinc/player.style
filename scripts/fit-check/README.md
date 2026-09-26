# fit-check

Renders every built skin on a phone and fails when its layout breaks: controls overflowing the player, text running
into other text, tap targets under 44px, menus opening outside the player. These are the defects a real iPhone showed
and desktop-width Chromium screenshots did not; the manual mobile QA pass measured them by hand, and this package
measures them on every CI run.

```sh
pnpm build:skins                                             # the check loads each skin's dist
pnpm -F fit-check exec playwright-core install chromium webkit
pnpm -F fit-check test
```

Use the `playwright-core` CLI pinned here (not `npx playwright`, which fetches the latest Playwright and its newer
browser builds). Set `PLAYWRIGHT_BROWSERS_PATH` if the browsers live outside Playwright's default cache. Chromium is
required. WebKit, the engine every iPhone browser runs, is checked when it is installed; without it the WebKit suite
is skipped and named `webkit (not installed: …)` in the output. The root `pnpm test` includes this package, and CI
installs both browsers before it runs.

## What it renders

Every package under `skins/` with a template, found the way the build-skin tests find them: a new skin is covered
without being listed anywhere. Each one is rendered:

- as the built HTML element (`dist/html.js`, `<name>-skin` inside the preset's `<*-player>`) and as the built React
  component (`dist/react.js` with `dist/skin.css` linked), both from the package's `dist`, as a consumer gets them;
- at 320 and 375px wide, with the player as wide as the phone and 44px of page above and below it;
- under phone emulation: touch, coarse pointer, an iPhone user agent, device pixel ratio 3;
- on the preset its template declares, so every `-live` package runs on the live-video player;
- with the registry e2e's WebM sample (`scripts/build-registry/e2e/media/sample.webm`; Playwright's Chromium has no
  H.264), a generated poster, an English captions track, the title "Landscape Promo", and "by Mux" in a `byline` slot
  where the template has one;
- in Chromium and WebKit.

The page is hermetic: the pages are bundled with Vite into a scratch directory, served from a local server started by
the test, and every request that does not go to that server is refused. Cases run concurrently, each in its own
browser context, and the two engines side by side; the whole matrix (33 skins × 2 frameworks × 2 widths × 2 engines)
takes about two minutes on four cores.

Each case is measured in two states:

1. **Paused, controls shown.** The media is played once (muted), paused at 35% and unmuted; then the player is tapped
   where no control is, again if that tap hid the controls, and paused again if the skin's tap plays.
2. **Each menu open.** Every painted control with `commandfor`, `popovertarget` or `aria-haspopup` is tapped, and the
   popup it opens is measured; so is every submenu a tap inside it opens.

## Rules

Every finding names its rule. Boxes are compared with 1px of slack. While the rules run, every endless animation
in the page (Winamp's scrolling marquee) is paused and then set going again, so a moving box and its text are read at
one instant: WebKit samples an accelerated animation afresh at each read, even within one task, and would otherwise
put the marquee's text a pixel outside its own box now and then.

| Rule | Fails when | Allowances |
| --- | --- | --- |
| `fit/overflow` | A row lays out a box past its own width: the skin root, or any flex or grid box laying out two or more painted children. A box that scrolls sideways (`overflow-x: auto` or `scroll` with more content than width) fails too. | The boxes a row lays out are its painted in-flow descendants, down to (and including) controls, sliders, SVGs and boxes that clip. Pseudo-elements (hit-area reach) and absolutely positioned elements (a thumb at the end of its track, decorations) are not laid out by the row; the other rules cover what they draw. This is why the check does not read `scrollWidth` directly: it counts those too. |
| `fit/outside-player` | A control's box leaves the player's box. | A slider is judged by its root, not its thumb. A control that paints no box of its own (no background, no border) is judged by what it draws: its text, its SVG shapes, its images. X-mas's bauble button is a tall transparent box whose drawing starts inside the player. |
| `text/overlap` | Two painted text boxes (line boxes, clipped by their clipping ancestors) intersect. | Text inside the other element is not an overlap. |
| `text/overflow` | A line of text leaves the box that holds it (its nearest box that is not inline) horizontally, or with its vertical centre outside it, or is cut by the player's edge. | A box that clips and ends lines with `text-overflow: ellipsis` truncates on purpose. Only the line's centre counts vertically, so glyphs past a tight `line-height` pass while a wrapped line spilling out of its box fails. Text may be clipped by a box of its own (Winamp's marquee window), never by the player's edge. |
| `target/size` | A painted control cannot be hit over a disc 44px across (WCAG 2.5.5). The hit area is found with `elementFromPoint` on a 1px grid, through shadow roots, flood-filled from the control's centre as far as 44px past its box; a hit counts when it lands on the control or inside it. A slider's target is its root. A menu row scrolled out of its list is scrolled into view first. | A disc, not a square, so a round 44px button passes. An undersized control passes when an equivalent one, with the same role and accessible name, meets the size (WCAG's equivalent exception: a second seek bar). A skin drawn at a fixed size needs each control hittable over its whole drawn box (up to 44px) instead: that is a skin none of whose controls changes size or spreads further apart when the page is 64px wider, a bitmap replica such as Winamp, whose 23 × 18px transport buttons cannot grow without scaling the artwork. |
| `popover/placement` | An open popup (a top-layer popover or modal dialog, or a painted `menu`, `listbox` or `dialog` role) leaves the player's box or the viewport. Checked in both states, so a tooltip left open by the tap counts too. | None. |

The rules take no per-skin exceptions. A finding on a skin is either a defect to fix in the skin (see
`docs/skins.md`) or evidence that a rule is wrong for a legitimate design, in which case the rule is refined here, for
every skin, with a fixture in `tests/rules.test.ts`.

## Reading a failure

A failing case is named `<engine> > <skin> > <framework> at <width>x<height> on the <preset> preset`, and its
assertion lists one line per finding:

```
[target/size] paused, controls shown: media-time.ps-remaining "Show duration, 6 seconds remaining.": the largest disc
it can be hit over is 40px across (hit area 39x44, drawn 26.8x24); needs 44px
```

That is `[rule] state: element: detail`. The state is `paused, controls shown` or `after tapping <trigger>` (and
`, then <submenu trigger>`). The element is its tag (`media-*` in the HTML element, the rendered tag in React), its
first three classes and its accessible name or text. Coordinates are CSS pixels in the viewport, where the player
starts 44px down. A control reported as `cannot be hit at all` names what covers its centre.

To look at a case, run a single one (`pnpm -F fit-check test -t "notflix"`, or `-t "webkit yt html"`), or bundle
the pages and open them yourself: `startServer(discoverSkins())` from `index.ts` serves `/html?skin=<name>&preset=…`
and `/react?skin=…`, and `window.fitCheck` in the page exposes the measurements.

## Files

| File | What it does |
| --- | --- |
| `index.ts` | Discovers the skins, bundles the pages, serves them, and drives each case through Playwright (`checkCase`, `checkPage`). |
| `page/runtime.ts` | The in-page half, exposed as `window.fitCheck`: mounts a skin, prepares the media, and runs the rules over the flat tree (shadow roots and slots), so one implementation reads both frameworks. |
| `page/html.ts`, `page/react.ts` | The two pages: how a consumer puts the HTML element or the React component on a page. |
| `page/fixture.ts` | Two hand-made players for the rule tests: one that breaks every rule, one that uses every allowance. |
| `tests/skins.test.ts` | The matrix above. |
| `tests/rules.test.ts` | The rules against the fixtures, and the skin discovery. |
