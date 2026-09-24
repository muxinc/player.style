import dynamic from 'next/dynamic';
import { type ComponentType, createElement, type CSSProperties, type ReactNode } from 'react';

export interface ThirdPartySkinComponentProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Only for skins whose `preview.metadata` says they render one; other skins would pass it on to the DOM. */
  byline?: ReactNode;
}

// Not a client module on purpose: the skin page's build-time guard reads the registry on the server, while the
// previews render it inside client components. Each loader below is itself a client module.
/**
 * The React edition of each third-party skin, loaded on demand so a skin's code and stylesheet reach the page only
 * when one of its previews renders. Each loader module imports the component and its `skin.css` together. A live card
 * registers `<name>-live` with a loader for `@player.style/<name>-live/react` once that package builds.
 */
const previews: Record<string, ComponentType<ThirdPartySkinComponentProps>> = {
  yt: dynamic(() => import('./third-party/yt')),
  sutro: dynamic(() => import('./third-party/sutro')),
  essentials: dynamic(() => import('./third-party/essentials')),
  'essentials-live': dynamic(() => import('./third-party/essentials-live')),
  notflix: dynamic(() => import('./third-party/notflix')),
  vimeonova: dynamic(() => import('./third-party/vimeonova')),
  instaplay: dynamic(() => import('./third-party/instaplay')),
  microvideo: dynamic(() => import('./third-party/microvideo')),
  'microvideo-live': dynamic(() => import('./third-party/microvideo-live')),
  reelplay: dynamic(() => import('./third-party/reelplay')),
  'demuxed-2022': dynamic(() => import('./third-party/demuxed-2022')),
  'demuxed-2022-live': dynamic(() => import('./third-party/demuxed-2022-live')),
  halloween: dynamic(() => import('./third-party/halloween')),
  'x-mas': dynamic(() => import('./third-party/x-mas')),
  'x-mas-live': dynamic(() => import('./third-party/x-mas-live')),
  winamp: dynamic(() => import('./third-party/winamp')),
  'sutro-audio': dynamic(() => import('./third-party/sutro-audio')),
  'tailwind-audio': dynamic(() => import('./third-party/tailwind-audio')),
};

export function hasThirdPartyPreview(slug: string): boolean {
  return slug in previews;
}

/** The registered loader for `slug`, or an error naming the loader file to add; a card never renders blank. */
function getPreview(slug: string): ComponentType<ThirdPartySkinComponentProps> {
  const component = previews[slug];
  if (!component) {
    throw new Error(
      `No preview loader registered for skin "${slug}": add site/lib/third-party/${slug}.tsx to previews.`
    );
  }

  return component;
}

/** Renders the registered skin for `slug` around its children. */
export function ThirdPartySkinPreview({ slug, ...props }: ThirdPartySkinComponentProps & { slug: string }) {
  return createElement(getPreview(slug), props);
}
