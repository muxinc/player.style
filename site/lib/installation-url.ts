import type { CodeLang } from './code-snippet';
import { DEFAULT_PRESET, PRESETS } from './presets';
import type { FirstPartySkin } from './skins';

/**
 * The framework-agnostic installation route on videojs.org, which redirects to the visitor's remembered framework
 * guide. The query mirrors `serializeInstallationSearch` in the Video.js docs: the preset and skin are written only
 * when they differ from the defaults, so the default video skin links to a clean URL.
 */
export function buildInstallationUrl(skin: FirstPartySkin): string {
  const params = new URLSearchParams();
  if (skin.docs.preset !== DEFAULT_PRESET) params.set('preset', PRESETS[skin.docs.preset].flag);
  if (skin.docs.skin !== 'default') params.set('skin', skin.docs.skin);

  const query = params.toString();

  return `https://videojs.org/docs/guides/installation${query ? `?${query}` : ''}`;
}

export interface UsageNames {
  html: { player: string; skin: string };
  react: { player: string; skin: string; media: string; entry: string };
}

/** Tag and component names for a skin, following the Video.js naming rules for presets and tiers. */
export function getUsageNames(skin: FirstPartySkin): UsageNames {
  const preset = PRESETS[skin.docs.preset];
  const minimal = skin.docs.skin === 'minimal';

  return {
    html: {
      player: `${preset.tagPrefix}-player`,
      skin: minimal ? `${preset.tagPrefix}-minimal-skin` : `${preset.tagPrefix}-skin`,
    },
    react: {
      player: `${preset.componentPrefix}Player`,
      skin: `${minimal ? 'Minimal' : ''}${preset.componentPrefix}Skin`,
      media: preset.mediaComponent,
      entry: `@videojs/react/${preset.flag}`,
    },
  };
}

export interface UsageSnippet {
  label: string;
  lang: CodeLang;
  code: string;
}

/** The one-line usage for each framework the packaged skin ships in. */
export function getUsageSnippets(skin: FirstPartySkin): UsageSnippet[] {
  const names = getUsageNames(skin);

  return [
    {
      label: 'HTML',
      lang: 'html',
      code: `<${names.html.player}><${names.html.skin}>…</${names.html.skin}></${names.html.player}>`,
    },
    {
      label: 'React',
      lang: 'tsx',
      code: `import { ${names.react.player}, ${names.react.skin}, ${names.react.media} } from '${names.react.entry}'`,
    },
  ];
}
