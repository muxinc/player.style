import type { CodeLang } from './code-snippet';
import {
  DEMO_AUDIO,
  DEMO_AUDIO_HLS,
  DEMO_CLOUDFLARE,
  DEMO_DASH,
  DEMO_LIVE_HLS,
  DEMO_LIVE_POSTER,
  DEMO_PORTRAIT_VIDEO,
  DEMO_SPOTIFY,
  DEMO_TIKTOK,
  DEMO_TWITCH,
  DEMO_VIDEO,
  DEMO_VIMEO,
  DEMO_YOUTUBE,
} from './demo-media';
import {
  getMediaOptions,
  isMuxRenderer,
  isVideoLikeRenderer,
  MUX_DATA_PACKAGE,
  MUX_DATA_SUBPATH,
  PRESETS,
  RENDERERS,
  resolveRenderer,
  USE_CASE_PRESETS,
  type MediaOption,
  type Renderer,
} from './presets';
import { registryInstallDirectory } from './registry';
import { buildHref, MEDIA_PARAM, USE_CASE_PARAM, type SearchParamsInput } from './search-params';
import { getShadcnImportBase } from './shadcn-install';
import {
  getDefaultUseCase,
  getThirdPartyPackage,
  getUseCaseLabel,
  type DocsPreset,
  type ThirdPartySkin,
  type UseCase,
} from './skins';

export const FRAMEWORKS = [
  { id: 'html', label: 'HTML' },
  { id: 'react', label: 'React' },
  { id: 'vue', label: 'Vue' },
  { id: 'svelte', label: 'Svelte' },
] as const;

export type Framework = (typeof FRAMEWORKS)[number]['id'];

export const DEFAULT_FRAMEWORK: Framework = 'html';

/** What the visitor picked on a third-party skin page; every field has a URL-free default. */
export interface UsageSelection {
  framework: Framework;
  renderer: Renderer;
  /** A six-digit hex accent without the `#`, only when the picker holds a non-default value. */
  accent?: string;
}

export function isFramework(value: string | null | undefined): value is Framework {
  return FRAMEWORKS.some((framework) => framework.id === value);
}

/**
 * The Video.js preset whose player hosts the skin for the use case, and whose renderer list the media picker shows.
 * Resolving the package first makes a use case the skin does not cover throw.
 */
export function getThirdPartyPreset(skin: ThirdPartySkin, useCase: UseCase): DocsPreset {
  return USE_CASE_PRESETS[getThirdPartyPackage(skin, useCase).useCase];
}

export function getThirdPartyMediaOptions(skin: ThirdPartySkin, useCase: UseCase): readonly MediaOption[] {
  return getMediaOptions(getThirdPartyPreset(skin, useCase));
}

export function resolveThirdPartyRenderer(
  skin: ThirdPartySkin,
  useCase: UseCase,
  value: string | null | undefined
): Renderer {
  return resolveRenderer(getThirdPartyPreset(skin, useCase), value);
}

/** The skin page's use-case picker: one option per package, labelled as the gallery filter labels them. */
export function getUseCaseOptions(skin: ThirdPartySkin): { id: UseCase; label: string }[] {
  return skin.useCases.map((useCase) => ({ id: useCase, label: getUseCaseLabel(useCase) }));
}

/**
 * The skin page with the use case switched and every other pick kept, except a media choice the target preset does
 * not offer (live video has no DASH) or already defaults to, which leaves the URL so the picker falls back cleanly.
 */
export function getUseCaseHref(skin: ThirdPartySkin, useCase: UseCase, searchParams: SearchParamsInput): string {
  return buildHref(`/skins/${skin.slug}`, searchParams, (params) => {
    if (useCase === getDefaultUseCase(skin)) params.delete(USE_CASE_PARAM);
    else params.set(USE_CASE_PARAM, useCase);

    const media = params.get(MEDIA_PARAM);
    const options = getThirdPartyMediaOptions(skin, useCase);
    if (media && (media === options[0]!.id || !options.some((option) => option.id === media))) {
      params.delete(MEDIA_PARAM);
    }
  });
}

export interface ThirdPartyNames {
  reactComponent: string;
  /**
   * The Vue or Svelte component that wraps the player, named after the skin (`YtPlayer`): named after its preset's
   * player instead (`VideoPlayer.vue`), a Vue component resolves its own `<video-player>` to itself and vue-tsc fails.
   */
  wrapperComponent: string;
  player: { tag: string; component: string; htmlEntry: string; reactEntry: string };
}

/**
 * The names a usage snippet writes: the installed component, the wrapper component, and the preset's player. Live video
 * is its own registry item, `<name>-live`, so the same rules give it `NameLiveSkin` on the live video preset's player.
 */
export function getThirdPartyNames(skin: ThirdPartySkin, useCase: UseCase): ThirdPartyNames {
  const { name } = getThirdPartyPackage(skin, useCase);
  const pascal = name.replace(/(^|-)([a-z0-9])/g, (_, __, letter: string) => letter.toUpperCase());
  const preset = PRESETS[getThirdPartyPreset(skin, useCase)];

  return {
    reactComponent: `${pascal}Skin`,
    wrapperComponent: `${pascal}Player`,
    player: {
      tag: `${preset.tagPrefix}-player`,
      component: `${preset.componentPrefix}Player`,
      htmlEntry: `@videojs/html/${preset.flag}/player`,
      reactEntry: `@videojs/react/${preset.flag}`,
    },
  };
}

// ---------------------------------------------------------------------------
// Demo media
// ---------------------------------------------------------------------------

function getDemoVideo(skin: ThirdPartySkin) {
  return skin.preview?.portrait ? DEMO_PORTRAIT_VIDEO : DEMO_VIDEO;
}

/** The source each media option plays in the snippets: the same asset the previews play, or the docs' sample. */
export function getDemoSource(skin: ThirdPartySkin, useCase: UseCase, renderer: Renderer): string {
  if (PRESETS[getThirdPartyPreset(skin, useCase)].live) return DEMO_LIVE_HLS;

  const video = getDemoVideo(skin);
  const sources: Record<Renderer, string> = {
    'html5-video': video.mp4,
    'html5-audio': DEMO_AUDIO,
    hls: video.hls,
    dash: DEMO_DASH,
    'mux-video': video.hls,
    'mux-audio': DEMO_AUDIO_HLS,
    vimeo: DEMO_VIMEO,
    youtube: DEMO_YOUTUBE,
    cloudflare: DEMO_CLOUDFLARE,
    spotify: DEMO_SPOTIFY,
    tiktok: DEMO_TIKTOK,
    twitch: DEMO_TWITCH,
  };

  return sources[renderer];
}

/** The poster the snippets show, for the media that render video rather than an embed or audio. */
function getDemoPoster(skin: ThirdPartySkin, useCase: UseCase, renderer: Renderer): string | undefined {
  if (!isVideoLikeRenderer(renderer)) return undefined;

  return PRESETS[getThirdPartyPreset(skin, useCase)].live ? DEMO_LIVE_POSTER : getDemoVideo(skin).poster;
}

// ---------------------------------------------------------------------------
// Install command
// ---------------------------------------------------------------------------

/**
 * The npm line for the media, as the Video.js installation guide writes it: the media's adapter package, and Mux Data
 * beside Mux media. The registry item brings the Video.js package, so there is no line when the media needs nothing.
 */
export function getThirdPartyInstallCommand(selection: UsageSelection): string | undefined {
  const packages: string[] = [];
  const adapter = RENDERERS[selection.renderer].adapter;
  if (adapter) packages.push(adapter);
  if (isMuxRenderer(selection.renderer)) packages.push(MUX_DATA_PACKAGE);

  return packages.length > 0 ? `npm install ${packages.join(' ')}` : undefined;
}

// ---------------------------------------------------------------------------
// Snippets
// ---------------------------------------------------------------------------

export interface SnippetFile {
  name: string;
  lang: CodeLang;
  code: string;
}

/** One code frame: a single file shows its name as the label, several show a file switcher. */
export interface SnippetBlock {
  label: string;
  files: SnippetFile[];
}

const MUX_DATA_COMMENT = 'Mux Data monitors playback quality; opt-in, included by default for Mux-hosted media.';

/** The placeholder comment every skin's `skin.html` marks the media's place with. */
const SKIN_MEDIA_PLACEHOLDER = '<!-- Add a compatible media element here. -->';

/** The installed markup is pasted in by hand; the comment names the file, as the registry item's own docs do. */
function pasteMarkupComment(skin: ThirdPartySkin, useCase: UseCase): string {
  return `Paste ${registryInstallDirectory(skin.name, useCase)}/skin.html here and put the media element where its placeholder comment is.`;
}

function accentAttribute(accent: string | undefined): string {
  return accent ? ` style="--media-accent-color: #${accent}"` : '';
}

function accentProp(accent: string | undefined): string {
  return accent ? ` style={{ '--media-accent-color': '#${accent}' }}` : '';
}

/** The media element, as HTML; `srcAttribute` is the source binding the framework uses. */
function getMediaElement(renderer: Renderer, srcAttribute: string): string {
  const { tag } = RENDERERS[renderer];
  const playsInline = isVideoLikeRenderer(renderer) ? ' playsinline' : '';

  return `<${tag} ${srcAttribute}${playsInline}></${tag}>`;
}

/** The media element and its Mux Data sibling, as HTML lines. */
function getMediaMarkup(renderer: Renderer, srcAttribute: string): string[] {
  const lines = [getMediaElement(renderer, srcAttribute)];
  if (isMuxRenderer(renderer)) lines.push(`<!-- ${MUX_DATA_COMMENT} -->`, `<mux-data></mux-data>`);

  return lines;
}

/**
 * The player markup for the HTML and Svelte snippets: the installed `skin.html` is pasted inside the player with the
 * media where its placeholder comment is, so the poster and the accent sit on the player.
 */
function getHtmlMarkup(
  skin: ThirdPartySkin,
  useCase: UseCase,
  selection: UsageSelection,
  srcAttribute: string
): string {
  const names = getThirdPartyNames(skin, useCase);
  const media = getMediaMarkup(selection.renderer, srcAttribute);
  const poster = getDemoPoster(skin, useCase, selection.renderer);

  return [
    `<${names.player.tag}${poster ? ` poster="${poster}"` : ''}${accentAttribute(selection.accent)}>`,
    `  <!-- ${pasteMarkupComment(skin, useCase)} -->`,
    ...media.map((line) => `  ${line}`),
    `</${names.player.tag}>`,
  ].join('\n');
}

/** The imports that register the player, the media, and Mux Data; the skin's own imports go between them. */
function getHtmlImports(skin: ThirdPartySkin, useCase: UseCase, selection: UsageSelection): string[] {
  const names = getThirdPartyNames(skin, useCase);
  const { subpath } = RENDERERS[selection.renderer];
  const base = getShadcnImportBase(skin, useCase, selection.framework);
  const imports = [`import '${names.player.htmlEntry}';`, `import '${base}/register';`, `import '${base}/skin.css';`];

  if (subpath) imports.push(`import '@videojs/html/media/${subpath}';`);
  if (isMuxRenderer(selection.renderer)) imports.push(`import '@videojs/html/extensions/${MUX_DATA_SUBPATH}';`);

  return imports;
}

/**
 * The installed files sit under `src/` of a Vite project, so the imports go in `src/player.ts`, as Video.js 10's own
 * HTML source install does.
 */
function getHtmlSnippets(skin: ThirdPartySkin, useCase: UseCase, selection: UsageSelection): SnippetBlock[] {
  const imports = getHtmlImports(skin, useCase, selection);
  const markup = getHtmlMarkup(skin, useCase, selection, `src="${getDemoSource(skin, useCase, selection.renderer)}"`);

  return [
    {
      label: 'Usage',
      files: [
        {
          name: 'index.html',
          lang: 'html',
          code: [markup, ``, `<script type="module" src="/src/player.ts"></script>`].join('\n'),
        },
        { name: 'src/player.ts', lang: 'ts', code: imports.join('\n') },
      ],
    },
  ];
}

function getReactSnippets(skin: ThirdPartySkin, useCase: UseCase, selection: UsageSelection): SnippetBlock[] {
  const names = getThirdPartyNames(skin, useCase);
  const { renderer } = selection;
  const { component, subpath } = RENDERERS[renderer];
  const preset = PRESETS[getThirdPartyPreset(skin, useCase)];
  const poster = getDemoPoster(skin, useCase, renderer);
  const source = getDemoSource(skin, useCase, renderer);

  // The preset entry exports the browser's own media; every other media has its own entry.
  const presetImports = [names.player.component, ...(subpath ? [] : [component])];
  const imports = [`import { ${presetImports.join(', ')} } from '${names.player.reactEntry}';`];
  if (subpath) imports.push(`import { ${component} } from '@videojs/react/media/${subpath}';`);
  if (isMuxRenderer(renderer)) imports.push(`import { MuxData } from '@videojs/react/extensions/${MUX_DATA_SUBPATH}';`);

  const base = getShadcnImportBase(skin, useCase, selection.framework);
  imports.push(`import { ${names.reactComponent} } from '${base}/Skin';`, ``, `import '${base}/skin.css';`);

  const mediaProps = `src="${source}"${isVideoLikeRenderer(renderer) ? ' playsInline' : ''}`;
  const media = [`<${component} ${mediaProps} />`];
  if (isMuxRenderer(renderer)) media.push(`{/* ${MUX_DATA_COMMENT} */}`, `<MuxData />`);

  const playerProps = poster ? ` poster="${poster}"` : '';
  const code = [
    ...imports,
    ``,
    `export function Player() {`,
    `  return (`,
    `    <${names.player.component}${playerProps}>`,
    `      <${names.reactComponent}${accentProp(selection.accent)}>`,
    ...media.map((line) => `        ${line}`),
    `      </${names.reactComponent}>`,
    `    </${names.player.component}>`,
    `  );`,
    `}`,
  ].join('\n');

  return [{ label: 'Usage', files: [{ name: `${preset.componentPrefix}Player.tsx`, lang: 'tsx', code }] }];
}

/** The custom elements a Vue template renders: the installed markup goes in through `v-html`, so only the player. */
function getCustomElementTags(skin: ThirdPartySkin, useCase: UseCase): string[] {
  return [getThirdPartyNames(skin, useCase).player.tag];
}

function getVueConfigFiles(tags: readonly string[]): SnippetFile[] {
  const elementSet = `const videoJsElements = new Set([${tags.map((tag) => `'${tag}'`).join(', ')}]);`;

  return [
    {
      name: 'vite.config.ts',
      lang: 'ts',
      code: [
        `import vue from '@vitejs/plugin-vue';`,
        `import { defineConfig } from 'vite';`,
        ``,
        elementSet,
        ``,
        `export default defineConfig({`,
        `  plugins: [`,
        `    vue({`,
        `      template: {`,
        `        compilerOptions: {`,
        `          isCustomElement: (tag) => videoJsElements.has(tag),`,
        `        },`,
        `      },`,
        `    }),`,
        `  ],`,
        `});`,
      ].join('\n'),
    },
    {
      name: 'nuxt.config.ts',
      lang: 'ts',
      code: [
        elementSet,
        ``,
        `export default defineNuxtConfig({`,
        `  vue: {`,
        `    compilerOptions: {`,
        `      isCustomElement: (tag) => videoJsElements.has(tag),`,
        `    },`,
        `  },`,
        `});`,
      ].join('\n'),
    },
  ];
}

/**
 * The Vue component for installed source. Vue renders a `<template>` element's children into the element rather than
 * its content, and the skins' chapters and menu items are `<template>`s the Video.js elements read, so the component
 * renders `skin.html` with `v-html` and puts the media where the placeholder comment is.
 */
function getVueShadcnComponent(skin: ThirdPartySkin, useCase: UseCase, selection: UsageSelection): string {
  const names = getThirdPartyNames(skin, useCase);
  const base = getShadcnImportBase(skin, useCase, selection.framework);
  const media = getMediaElement(selection.renderer, `src="\${props.src.replaceAll('"', '&quot;')}"`);
  const muxData = isMuxRenderer(selection.renderer);

  return [
    `<script setup lang="ts">`,
    ...getHtmlImports(skin, useCase, selection),
    ``,
    `import { computed } from 'vue';`,
    ``,
    `import skin from '${base}/skin.html?raw';`,
    ``,
    `const props = defineProps<{ src: string }>();`,
    ``,
    `// Vue cannot render the skin's <template> elements, so the markup goes in as HTML.`,
    ...(muxData ? [`// ${MUX_DATA_COMMENT}`] : []),
    `const markup = computed(() =>`,
    `  skin.replace(`,
    `    '${SKIN_MEDIA_PLACEHOLDER}',`,
    `    \`${media}${muxData ? '<mux-data></mux-data>' : ''}\``,
    `  )`,
    `);`,
    `</script>`,
    ``,
    `<template>`,
    `  <${names.player.tag} v-html="markup"${accentAttribute(selection.accent)}></${names.player.tag}>`,
    `</template>`,
  ].join('\n');
}

function getVueSnippets(skin: ThirdPartySkin, useCase: UseCase, selection: UsageSelection): SnippetBlock[] {
  const component = getThirdPartyNames(skin, useCase).wrapperComponent;
  const sfc = getVueShadcnComponent(skin, useCase, selection);

  const usage = [
    `<script setup lang="ts">`,
    `import ${component} from './components/${component}.vue';`,
    `</script>`,
    ``,
    `<template>`,
    `  <${component} src="${getDemoSource(skin, useCase, selection.renderer)}" />`,
    `</template>`,
  ].join('\n');

  return [
    { label: 'Register the custom elements', files: getVueConfigFiles(getCustomElementTags(skin, useCase)) },
    { label: 'Component', files: [{ name: `components/${component}.vue`, lang: 'vue', code: sfc }] },
    { label: 'Usage', files: [{ name: 'App.vue', lang: 'vue', code: usage }] },
  ];
}

function getSvelteSnippets(skin: ThirdPartySkin, useCase: UseCase, selection: UsageSelection): SnippetBlock[] {
  const component = getThirdPartyNames(skin, useCase).wrapperComponent;

  const sfc = [
    `<script lang="ts">`,
    ...getHtmlImports(skin, useCase, selection).map((line) => `  ${line}`),
    ``,
    `  let { src }: { src: string } = $props();`,
    `</script>`,
    ``,
    getHtmlMarkup(skin, useCase, selection, 'src={src}'),
  ].join('\n');

  const usage = (path: string) =>
    [
      `<script lang="ts">`,
      `  import ${component} from '${path}';`,
      `</script>`,
      ``,
      `<${component} src="${getDemoSource(skin, useCase, selection.renderer)}" />`,
    ].join('\n');

  return [
    { label: 'Component', files: [{ name: `lib/${component}.svelte`, lang: 'svelte', code: sfc }] },
    {
      label: 'Usage',
      files: [
        { name: '+page.svelte', lang: 'svelte', code: usage(`$lib/${component}.svelte`) },
        { name: 'App.svelte', lang: 'svelte', code: usage(`./lib/${component}.svelte`) },
      ],
    },
  ];
}

/**
 * Pasteable code for the selection, after the install line: the player around the installed skin around the media, on
 * the demo media the previews play, with the accent inline when one is set. Vue and Svelte use the HTML files,
 * following the Video.js installation guides for each; Vue also needs its compiler told which tags are custom
 * elements, Svelte passes hyphenated tags through on its own.
 */
export function getThirdPartySnippets(
  skin: ThirdPartySkin,
  useCase: UseCase,
  selection: UsageSelection
): SnippetBlock[] {
  switch (selection.framework) {
    case 'react':
      return getReactSnippets(skin, useCase, selection);
    case 'vue':
      return getVueSnippets(skin, useCase, selection);
    case 'svelte':
      return getSvelteSnippets(skin, useCase, selection);
    default:
      return getHtmlSnippets(skin, useCase, selection);
  }
}
