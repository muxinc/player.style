'use client';

import { MEDIA_PLACEHOLDER, presetModule, skinBuildKey } from 'build-skin/names';
import dynamic from 'next/dynamic';
import { type ComponentType, type CSSProperties, type ReactNode, useEffect, useRef, useState } from 'react';

import { HTML, REACT } from './skin-builds';
import type { ThirdPartySkin, UseCase } from './skins';

export interface ReactSkinProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Only for skins whose `preview.metadata` says they render one; other skins would pass it on to the DOM. */
  byline?: ReactNode;
}

/**
 * Every skin's React build per use case, each loaded on demand (`skins/<name>/react/dist/<preset>.js`, which imports
 * its own CSS) and created once, so re-renders keep the mounted component.
 */
const REACT_SKINS: Record<string, ComponentType<ReactSkinProps>> = Object.fromEntries(
  Object.entries(REACT).map(([key, load]) => {
    const component = presetModule(key.split('/')[2] as UseCase).skinComponent;

    return [
      key,
      dynamic(() => load().then((module) => (module as Record<string, ComponentType<ReactSkinProps>>)[component]!)),
    ];
  })
);

/** A skin's React build for a use case. */
export function ReactSkin({ skin, useCase, ...props }: ReactSkinProps & { skin: ThirdPartySkin; useCase: UseCase }) {
  const Component = REACT_SKINS[skinBuildKey(skin.slug, 'react', useCase)];
  if (!Component) throw new Error(`No React build of ${skin.slug} for ${useCase}: run pnpm build:skins.`);

  return <Component {...props} />;
}

/** The players an HTML build mounts in, and the media elements the previews use, registered on demand. */
const PLAYERS: Record<UseCase, () => Promise<unknown>> = {
  video: () => import('@videojs/html/video/player'),
  audio: () => Promise.all([import('@videojs/html/audio/player'), import('@videojs/html/media/mux-audio')]),
  'live-video': () => Promise.all([import('@videojs/html/live-video/player'), import('@videojs/html/media/mux-video')]),
  'live-audio': () => Promise.all([import('@videojs/html/live-audio/player'), import('@videojs/html/media/mux-audio')]),
};

const ID_ATTRIBUTES = /\b(id|for|commandfor|trigger|popovertarget|aria-(?:controls|labelledby|describedby))="([^"]*)"/g;

/** Fragment links to an element of the same markup, as an SVG `<use>` draws another glyph's outline. */
const ID_HREFS = /\b((?:xlink:)?href)="#([^"]+)"/g;

let instances = 0;

/**
 * Suffix every id and id reference in the markup, so two previews of skins with the same ids (`skin create` writes
 * the same tooltip and menu ids for every skin on one base) wire up their own popups.
 */
export function suffixIds(markup: string, suffix: string): string {
  return markup
    .replace(
      ID_ATTRIBUTES,
      (_match, attribute: string, value: string) =>
        `${attribute}="${value
          .split(/\s+/)
          .map((id) => (id ? `${id}-${suffix}` : id))
          .join(' ')}"`
    )
    .replace(ID_HREFS, (_match, attribute: string, id: string) => `${attribute}="#${id}-${suffix}"`);
}

export interface HtmlSkinProps {
  skin: ThirdPartySkin;
  useCase: UseCase;
  /** The media element's markup, put where the skin's placeholder comment is. */
  media: string;
  poster?: string;
  title?: string;
  /** Classes and styles for the skin's root (`.media-skin`); the wrapper holds `className` until it mounts. */
  className?: string;
  style?: CSSProperties;
}

/**
 * A skin's HTML build, as its registry item's docs use it: the preset's player element with `skin.html` inside and the
 * media where its placeholder comment is. Client-only: it mounts after hydration, while the wrapper keeps the box.
 */
export function HtmlSkin({ skin, useCase, media, poster, title, className, style }: HtmlSkinProps) {
  const wrapper = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const key = skinBuildKey(skin.slug, 'html', useCase);

  useEffect(() => {
    const load = HTML[key];
    if (!load) throw new Error(`No HTML build of ${skin.slug} for ${useCase}: run pnpm build:skins.`);

    const container = wrapper.current;
    let cancelled = false;

    void Promise.all([PLAYERS[useCase](), load()]).then(([, module]) => {
      if (cancelled || !container) return;

      const template = (module as { default: string }).default;
      const player = document.createElement(presetModule(useCase).playerTag);

      if (poster) player.setAttribute('poster', poster);
      if (title) player.setAttribute('content-title', title);
      player.innerHTML = suffixIds(template, String(++instances)).replace(MEDIA_PLACEHOLDER, media);
      root.current = player.querySelector<HTMLElement>('.media-skin');
      if (className) root.current?.classList.add(...className.split(/\s+/).filter(Boolean));

      container.replaceChildren(player);
      setMounted(true);
    });

    return () => {
      cancelled = true;
      root.current = null;
      container?.replaceChildren();
      setMounted(false);
    };
  }, [key, skin.slug, useCase, media, poster, title, className]);

  // The accent follows the picker as it drags, so it is set on the mounted root rather than remounting the player.
  useEffect(() => {
    const element = root.current;
    if (!element) return;

    element.removeAttribute('style');
    for (const [property, value] of Object.entries(style ?? {})) element.style.setProperty(property, String(value));
  }, [mounted, style]);

  return <div ref={wrapper} className={mounted ? 'w-full' : className} />;
}
