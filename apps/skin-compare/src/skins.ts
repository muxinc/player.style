import type { ComponentType, CSSProperties, ReactNode } from 'react';

export interface ReactSkinProps {
  children?: ReactNode;
  style?: CSSProperties;
}

export interface CompareSkin {
  /** The Media Chrome edition on npm, pinned so the reference does not drift, and its theme tag. */
  legacy: { pkg: string; version: string; tag: string };
  /** The Video.js 10 HTML edition's tag. */
  tag: string;
  /** Registers the HTML edition; imported from the skin's source so no build step sits between edits and the pane. */
  html: () => Promise<unknown>;
  react: () => Promise<{ Skin: ComponentType<ReactSkinProps> }>;
  css: () => Promise<unknown>;
}

/* Add a line per ported skin. The paths point at sources under `skins/*`, so `pnpm dev` picks edits up live. */
export const SKINS: Record<string, CompareSkin> = {
  microvideo: {
    legacy: { pkg: '@player.style/microvideo', version: '0.2.0', tag: 'media-theme-microvideo' },
    tag: 'microvideo-skin',
    html: () => import('../../../skins/microvideo/src/html/index.ts'),
    react: () => import('../../../skins/microvideo/src/react/index.tsx').then((m) => ({ Skin: m.MicrovideoSkin })),
    css: () => import('../../../skins/microvideo/src/skin.css'),
  },
};

export function getSkin(name: string): CompareSkin {
  const skin = SKINS[name];
  if (!skin) throw new Error(`Unknown skin "${name}". Add it to apps/skin-compare/src/skins.ts.`);

  return skin;
}
