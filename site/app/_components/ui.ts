/**
 * Class recipes shared across the site, copied from the Video.js 10 site so both properties render the same controls.
 * Compose them with `clsx`; a component that needs a variant adds classes rather than forking the recipe.
 */

export const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-gold';

export const cardFocusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold';

/**
 * Grows a small control's hit area to at least 44×44 with an invisible `::after` centred on it, so a touch lands on it
 * without the control drawing any larger. The control becomes the pseudo-element's containing block (`relative`), and
 * its neighbours need enough room around it for the hit areas not to overlap.
 */
export const touchTarget =
  'relative after:absolute after:top-1/2 after:left-1/2 after:size-full after:min-h-11 after:min-w-11 after:-translate-1/2';

export const buttonPrimary = [
  'inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg corner-squircle px-5 text-p3 font-semibold shadow-sm transition select-none',
  touchTarget,
  'bg-faded-black text-manila-light intent:bg-accent intent:text-faded-black dark:bg-manila-light dark:text-faded-black',
  cardFocusRing,
].join(' ');

export const buttonSecondary = [
  'inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg corner-squircle border border-line bg-surface px-3 text-p3 whitespace-nowrap text-muted shadow-xs select-none',
  'intent:border-line-strong intent:text-faded-black dark:intent:text-manila-light',
  touchTarget,
  focusRing,
].join(' ');

export const pill =
  'inline-flex h-7 items-center gap-1.5 rounded-full corner-squircle border border-line bg-surface-raised pr-3 pl-2.5 text-p3 font-medium intent:border-line-strong';

export const textLink = 'underline intent:decoration-gold';

/** Side by side in the nav, so on touch screens they grow to 44px rather than reaching over each other. */
export const navIconButton = [
  'flex size-10 cursor-pointer items-center justify-center rounded-md corner-squircle intent:bg-hover pointer-coarse:size-11',
  focusRing,
].join(' ');

/** The double-frame chip that opens and closes the mobile menu. */
export const menuChip = [
  'inline-flex cursor-pointer items-stretch rounded-md corner-squircle border-2 border-faded-black p-0.75 dark:border-manila-light',
  touchTarget,
].join(' ');

export const menuChipLabel =
  'bg-faded-black p-2 font-display text-[0.625rem] leading-none font-bold tracking-normal text-manila-light uppercase dark:bg-manila-light dark:text-faded-black';

export const inlineCode =
  'rounded border border-manila-75 bg-manila-25 px-1 font-mono text-code dark:border-warm-gray dark:bg-soot';
