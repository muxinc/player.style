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
import type { DocsPreset, ThirdPartySkin } from './skins';

export const FRAMEWORKS = [
  { id: 'html', label: 'HTML' },
  { id: 'react', label: 'React' },
  { id: 'vue', label: 'Vue' },
  { id: 'svelte', label: 'Svelte' },
] as const;

export type Framework = (typeof FRAMEWORKS)[number]['id'];

export const DEFAULT_FRAMEWORK: Framework = 'html';

/** Packaged installs the skin from npm; Open copies its source files into the project. */
export const INSTALL_KINDS = [
  { id: 'packaged', label: 'Packaged' },
  { id: 'open', label: 'Open' },
] as const;

export type InstallKind = (typeof INSTALL_KINDS)[number]['id'];

export const DEFAULT_INSTALL_KIND: InstallKind = 'packaged';

/** What the visitor picked on a third-party skin page; every field has a URL-free default. */
export interface UsageSelection {
  framework: Framework;
  renderer: Renderer;
  install: InstallKind;
  /** A six-digit hex accent without the `#`, only when the picker holds a non-default value. */
  accent?: string;
}

export function isFramework(value: string | null | undefined): value is Framework {
  return FRAMEWORKS.some((framework) => framework.id === value);
}

export function isInstallKind(value: string | null | undefined): value is InstallKind {
  return INSTALL_KINDS.some((kind) => kind.id === value);
}

/** The Video.js preset whose player hosts the skin, and whose renderer list the media picker shows. */
export function getThirdPartyPreset(skin: ThirdPartySkin): DocsPreset {
  return USE_CASE_PRESETS[skin.useCase];
}

export function getThirdPartyMediaOptions(skin: ThirdPartySkin): readonly MediaOption[] {
  return getMediaOptions(getThirdPartyPreset(skin));
}

export function resolveThirdPartyRenderer(skin: ThirdPartySkin, value: string | null | undefined): Renderer {
  return resolveRenderer(getThirdPartyPreset(skin), value);
}

export interface ThirdPartyNames {
  htmlTag: string;
  reactComponent: string;
  rootClass: string;
  /** The package entry that registers the HTML edition. */
  htmlEntry: string;
  /** The package entry that exports the React edition. */
  reactEntry: string;
  stylesheet: string;
  player: { tag: string; component: string; htmlEntry: string; reactEntry: string };
}

/** The HTML edition's entry, today the package root; kept in one place because it is due to move to `/html`. */
function getHtmlEntry(skin: ThirdPartySkin): string {
  return skin.package;
}

/**
 * Third-party skins are published as `@player.style/<name>`; the name gives the tag, component, and root class. A live
 * edition is its own package, `<name>-live`, so the same rules give it `<name>-live-skin` and `NameLiveSkin`; it sits
 * on the live video preset's player.
 */
export function getThirdPartyNames(skin: ThirdPartySkin): ThirdPartyNames {
  const pascal = skin.name.replace(/(^|-)([a-z0-9])/g, (_, __, letter: string) => letter.toUpperCase());
  const preset = PRESETS[getThirdPartyPreset(skin)];

  return {
    htmlTag: `${skin.name}-skin`,
    reactComponent: `${pascal}Skin`,
    rootClass: `ps-${skin.name}`,
    htmlEntry: getHtmlEntry(skin),
    reactEntry: `${skin.package}/react`,
    stylesheet: `${skin.package}/skin.css`,
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
export function getDemoSource(skin: ThirdPartySkin, renderer: Renderer): string {
  if (PRESETS[getThirdPartyPreset(skin)].live) return DEMO_LIVE_HLS;

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
function getDemoPoster(skin: ThirdPartySkin, renderer: Renderer): string | undefined {
  if (!isVideoLikeRenderer(renderer)) return undefined;

  return PRESETS[getThirdPartyPreset(skin)].live ? DEMO_LIVE_POSTER : getDemoVideo(skin).poster;
}

// ---------------------------------------------------------------------------
// Install command
// ---------------------------------------------------------------------------

/** The framework package a selection installs: the React bindings for React, the custom elements for everything else. */
function getVideojsPackage(framework: Framework): string {
  return framework === 'react' ? '@videojs/react' : '@videojs/html';
}

/**
 * The npm install line: the skin package (unless the source files are copied in), the Video.js package for the
 * framework, the media's adapter package, and Mux Data beside Mux media, as the Video.js installation guide does.
 */
export function getThirdPartyInstallCommand(skin: ThirdPartySkin, selection: UsageSelection): string {
  const packages = selection.install === 'packaged' ? [skin.package] : [];
  packages.push(getVideojsPackage(selection.framework));

  const adapter = RENDERERS[selection.renderer].adapter;
  if (adapter) packages.push(adapter);
  if (isMuxRenderer(selection.renderer)) packages.push(MUX_DATA_PACKAGE);

  return `npm install ${packages.join(' ')}`;
}

// ---------------------------------------------------------------------------
// Snippets
// ---------------------------------------------------------------------------

export interface SnippetFile {
  name: string;
  code: string;
}

/** One code frame: a single file shows its name as the label, several show a file switcher. */
export interface SnippetBlock {
  label: string;
  files: SnippetFile[];
}

const MUX_DATA_HTML_COMMENT = 'Mux Data monitors playback quality; opt-in, included by default for Mux-hosted media.';

const OPEN_MARKUP_COMMENT = 'Paste skin.html here and put the media element where its placeholder comment is.';

function indent(block: string, spaces: number): string {
  const pad = ' '.repeat(spaces);

  return block
    .split('\n')
    .map((line) => (line ? `${pad}${line}` : line))
    .join('\n');
}

function accentAttribute(accent: string | undefined): string {
  return accent ? ` style="--media-accent-color: #${accent}"` : '';
}

function accentProp(accent: string | undefined): string {
  return accent ? ` style={{ '--media-accent-color': '#${accent}' }}` : '';
}

/** The media element and its Mux Data sibling, as HTML; `srcAttribute` is the source binding the framework uses. */
function getMediaMarkup(renderer: Renderer, srcAttribute: string): string[] {
  const { tag } = RENDERERS[renderer];
  const playsInline = isVideoLikeRenderer(renderer) ? ' playsinline' : '';
  const lines = [`<${tag} ${srcAttribute}${playsInline}></${tag}>`];
  if (isMuxRenderer(renderer)) lines.push(`<!-- ${MUX_DATA_HTML_COMMENT} -->`, `<mux-data></mux-data>`);

  return lines;
}

/**
 * The player markup for the HTML edition, shared by the HTML, Vue, and Svelte snippets. The packaged skin element
 * wraps the media; the open edition pastes `skin.html` in its place, so the accent moves up to the player.
 */
function getHtmlMarkup(skin: ThirdPartySkin, selection: UsageSelection, srcAttribute: string): string {
  const names = getThirdPartyNames(skin);
  const media = getMediaMarkup(selection.renderer, srcAttribute);
  const poster = getDemoPoster(skin, selection.renderer);

  if (selection.install === 'open') {
    return [
      `<${names.player.tag}${accentAttribute(selection.accent)}>`,
      `  <!-- ${OPEN_MARKUP_COMMENT} -->`,
      ...media.map((line) => `  ${line}`),
      `</${names.player.tag}>`,
    ].join('\n');
  }

  return [
    `<${names.player.tag}>`,
    `  <${names.htmlTag}${accentAttribute(selection.accent)}>`,
    ...media.map((line) => `    ${line}`),
    ...(poster ? [`    <img slot="poster" src="${poster}" alt="" />`] : []),
    `  </${names.htmlTag}>`,
    `</${names.player.tag}>`,
  ].join('\n');
}

/** The side-effect imports the HTML edition needs: player, skin (or its open files), media, and Mux Data. */
function getHtmlImports(skin: ThirdPartySkin, selection: UsageSelection): string[] {
  const names = getThirdPartyNames(skin);
  const { subpath } = RENDERERS[selection.renderer];
  const imports = [`import '${names.player.htmlEntry}';`];

  if (selection.install === 'open') imports.push(`import './register';`, `import './skin.css';`);
  else imports.push(`import '${names.htmlEntry}';`);

  if (subpath) imports.push(`import '@videojs/html/media/${subpath}';`);
  if (isMuxRenderer(selection.renderer)) imports.push(`import '@videojs/html/extensions/${MUX_DATA_SUBPATH}';`);

  return imports;
}

function getHtmlSnippets(skin: ThirdPartySkin, selection: UsageSelection): SnippetBlock[] {
  const code = [
    `<script type="module">`,
    ...getHtmlImports(skin, selection).map((line) => `  ${line}`),
    `</script>`,
    ``,
    getHtmlMarkup(skin, selection, `src="${getDemoSource(skin, selection.renderer)}"`),
  ].join('\n');

  return [{ label: 'Usage', files: [{ name: 'index.html', code }] }];
}

function getReactSnippets(skin: ThirdPartySkin, selection: UsageSelection): SnippetBlock[] {
  const names = getThirdPartyNames(skin);
  const { renderer } = selection;
  const { component, subpath } = RENDERERS[renderer];
  const preset = PRESETS[getThirdPartyPreset(skin)];
  const poster = getDemoPoster(skin, renderer);
  const source = getDemoSource(skin, renderer);

  // The preset entry exports the browser's own media; every other media has its own entry.
  const presetImports = [names.player.component, ...(subpath ? [] : [component])];
  const imports = [`import { ${presetImports.join(', ')} } from '${names.player.reactEntry}';`];
  if (subpath) imports.push(`import { ${component} } from '@videojs/react/media/${subpath}';`);
  if (isMuxRenderer(renderer)) imports.push(`import { MuxData } from '@videojs/react/extensions/${MUX_DATA_SUBPATH}';`);

  if (selection.install === 'open')
    imports.push(`import { ${names.reactComponent} } from './Skin';`, ``, `import './skin.css';`);
  else
    imports.push(`import { ${names.reactComponent} } from '${names.reactEntry}';`, ``, `import '${names.stylesheet}';`);

  const mediaProps = `src="${source}"${isVideoLikeRenderer(renderer) ? ' playsInline' : ''}`;
  const media = [`<${component} ${mediaProps} />`];
  if (isMuxRenderer(renderer)) media.push(`{/* ${MUX_DATA_HTML_COMMENT} */}`, `<MuxData />`);

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

  return [{ label: 'Usage', files: [{ name: `${preset.componentPrefix}Player.tsx`, code }] }];
}

/** The custom elements a Vue template renders, for the compiler's `isCustomElement`. */
function getCustomElementTags(skin: ThirdPartySkin, selection: UsageSelection): string[] {
  const names = getThirdPartyNames(skin);
  const { tag } = RENDERERS[selection.renderer];
  const tags = [names.player.tag];

  if (selection.install === 'packaged') tags.push(names.htmlTag);
  if (tag.includes('-')) tags.push(tag);
  if (isMuxRenderer(selection.renderer)) tags.push('mux-data');

  return tags;
}

function getVueSnippets(skin: ThirdPartySkin, selection: UsageSelection): SnippetBlock[] {
  const preset = PRESETS[getThirdPartyPreset(skin)];
  const component = `${preset.componentPrefix}Player`;
  const tags = getCustomElementTags(skin, selection)
    .map((tag) => `'${tag}'`)
    .join(', ');
  const elementSet = `const videoJsElements = new Set([${tags}]);`;

  const config: SnippetFile[] = [
    {
      name: 'vite.config.ts',
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

  const sfc = [
    `<script setup lang="ts">`,
    ...getHtmlImports(skin, selection),
    ``,
    `defineProps<{ src: string }>();`,
    `</script>`,
    ``,
    `<template>`,
    indent(getHtmlMarkup(skin, selection, ':src="src"'), 2),
    `</template>`,
  ].join('\n');

  const usage = [
    `<script setup lang="ts">`,
    `import ${component} from './components/${component}.vue';`,
    `</script>`,
    ``,
    `<template>`,
    `  <${component} src="${getDemoSource(skin, selection.renderer)}" />`,
    `</template>`,
  ].join('\n');

  return [
    { label: 'Register the custom elements', files: config },
    { label: 'Component', files: [{ name: `${component}.vue`, code: sfc }] },
    { label: 'Usage', files: [{ name: 'App.vue', code: usage }] },
  ];
}

function getSvelteSnippets(skin: ThirdPartySkin, selection: UsageSelection): SnippetBlock[] {
  const preset = PRESETS[getThirdPartyPreset(skin)];
  const component = `${preset.componentPrefix}Player`;

  const sfc = [
    `<script lang="ts">`,
    ...getHtmlImports(skin, selection).map((line) => `  ${line}`),
    ``,
    `  let { src }: { src: string } = $props();`,
    `</script>`,
    ``,
    getHtmlMarkup(skin, selection, 'src={src}'),
  ].join('\n');

  const usage = (path: string) =>
    [
      `<script lang="ts">`,
      `  import ${component} from '${path}';`,
      `</script>`,
      ``,
      `<${component} src="${getDemoSource(skin, selection.renderer)}" />`,
    ].join('\n');

  return [
    { label: 'Component', files: [{ name: `${component}.svelte`, code: sfc }] },
    {
      label: 'Usage',
      files: [
        { name: '+page.svelte', code: usage(`$lib/${component}.svelte`) },
        { name: 'App.svelte', code: usage(`./lib/${component}.svelte`) },
      ],
    },
  ];
}

/**
 * Pasteable code for the selection, after the install line: the player around the skin around the media, on the demo
 * media the previews play, with the accent inline on the skin when one is set. Vue and Svelte use the HTML edition,
 * following the Video.js installation guides for each; Vue also needs its compiler told which tags are custom
 * elements, Svelte passes hyphenated tags through on its own.
 */
export function getThirdPartySnippets(skin: ThirdPartySkin, selection: UsageSelection): SnippetBlock[] {
  switch (selection.framework) {
    case 'react':
      return getReactSnippets(skin, selection);
    case 'vue':
      return getVueSnippets(skin, selection);
    case 'svelte':
      return getSvelteSnippets(skin, selection);
    default:
      return getHtmlSnippets(skin, selection);
  }
}
