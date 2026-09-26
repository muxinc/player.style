import { type SourceId, SOURCES } from './media';
import { SKINS, type SkinPackage } from './skins';

export type Framework = 'react' | 'html';

export interface SandboxState {
  skin: string;
  framework: Framework;
  source: SourceId;
  /** A hex colour without `#`, or empty for the skin's own accent. */
  accent: string;
}

export function getSkin(name: string): SkinPackage {
  return SKINS.find((skin) => skin.name === name) ?? SKINS[0];
}

/** A live skin opens on the live stream, any other on the MP4. */
export function defaultSource(skin: SkinPackage): SourceId {
  return skin.preset === 'live-video' ? 'live' : 'mp4';
}

/** Reads the selection from the query string, falling back to a valid default for anything missing or unknown. */
export function readState(search = window.location.search): SandboxState {
  const params = new URLSearchParams(search);
  const skin = getSkin(params.get('skin') ?? '');
  const source = SOURCES.find(({ id }) => id === params.get('source'))?.id ?? defaultSource(skin);
  const accent = params.get('accent') ?? '';

  return {
    skin: skin.name,
    framework: params.get('framework') === 'html' ? 'html' : 'react',
    source,
    accent: /^[\da-f]{6}$/i.test(accent) ? accent.toLowerCase() : '',
  };
}

/** Mirrors the selection into the query string, so the address bar is always a link to what is on screen. */
export function writeState(state: SandboxState) {
  const params = new URLSearchParams({ skin: state.skin, framework: state.framework, source: state.source });

  if (state.accent) params.set('accent', state.accent);

  window.history.replaceState(null, '', `?${params}`);
}
