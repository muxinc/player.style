'use client';

import dynamic from 'next/dynamic';
import { type ComponentType, createElement, type CSSProperties, type ReactNode } from 'react';

export interface ThirdPartySkinComponentProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Only for skins whose `preview.metadata` says they render one; other skins would pass it on to the DOM. */
  byline?: ReactNode;
}

/**
 * The React edition of each third-party skin, loaded on demand so a skin's code and stylesheet reach the page only
 * when one of its previews renders. Each loader module imports the component and its `skin.css` together.
 */
const previews: Record<string, ComponentType<ThirdPartySkinComponentProps>> = {
  yt: dynamic(() => import('./third-party/yt')),
  sutro: dynamic(() => import('./third-party/sutro')),
  essentials: dynamic(() => import('./third-party/essentials')),
  notflix: dynamic(() => import('./third-party/notflix')),
  vimeonova: dynamic(() => import('./third-party/vimeonova')),
  instaplay: dynamic(() => import('./third-party/instaplay')),
  microvideo: dynamic(() => import('./third-party/microvideo')),
  reelplay: dynamic(() => import('./third-party/reelplay')),
  'demuxed-2022': dynamic(() => import('./third-party/demuxed-2022')),
  halloween: dynamic(() => import('./third-party/halloween')),
  'x-mas': dynamic(() => import('./third-party/x-mas')),
  winamp: dynamic(() => import('./third-party/winamp')),
  'sutro-audio': dynamic(() => import('./third-party/sutro-audio')),
  'tailwind-audio': dynamic(() => import('./third-party/tailwind-audio')),
};

export function hasThirdPartyPreview(slug: string): boolean {
  return slug in previews;
}

/** Renders the registered skin for `slug` around its children; nothing when the skin has no preview yet. */
export function ThirdPartySkinPreview({ slug, ...props }: ThirdPartySkinComponentProps & { slug: string }) {
  const component = previews[slug];

  return component ? createElement(component, props) : null;
}
