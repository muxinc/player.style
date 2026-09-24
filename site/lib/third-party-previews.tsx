'use client';

import dynamic from 'next/dynamic';
import { type ComponentType, createElement, type CSSProperties, type ReactNode } from 'react';

export interface ThirdPartySkinComponentProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * The React edition of each third-party skin, loaded on demand so a skin's code and stylesheet reach the page only
 * when one of its previews renders. Each loader module imports the component and its `skin.css` together.
 */
const previews: Record<string, ComponentType<ThirdPartySkinComponentProps>> = {
  microvideo: dynamic(() => import('./third-party/microvideo')),
};

export function hasThirdPartyPreview(slug: string): boolean {
  return slug in previews;
}

/** Renders the registered skin for `slug` around its children; nothing when the skin has no preview yet. */
export function ThirdPartySkinPreview({ slug, ...props }: ThirdPartySkinComponentProps & { slug: string }) {
  const component = previews[slug];

  return component ? createElement(component, props) : null;
}
