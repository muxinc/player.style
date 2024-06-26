import Code from './Code';
import mediaElements from '@/media-elements';
import { findParam } from '@/app/_utils/utils';

type DocsInstallProps = {
  searchParams: Record<string, string | string[]>;
  theme: string;
};

export default async function DocsEmbed(props: DocsInstallProps) {
  const { searchParams, theme } = props;

  const media = findParam(searchParams, 'media') ?? 'video';
  const mediaElement = mediaElements[media as keyof typeof mediaElements];

  const framework = findParam(searchParams, 'framework') ?? 'html';
  const mediaPackage =
    mediaElement.package?.[framework as keyof typeof mediaElement.package] ??
    (mediaElement.package?.default as string);

  let blocks: any[] = [];
  switch (framework) {
    case 'react':
      blocks = reactCode(theme, mediaElement, mediaPackage);
      break;
    case 'vue':
      blocks = vueCode(theme, mediaElement, mediaPackage);
      break;
    case 'svelte':
      blocks = svelteCode(theme, mediaElement, mediaPackage);
      break;
    case 'html':
      blocks = htmlCode(theme, mediaElement, mediaPackage);
      break;
    default:
      blocks = jsCode(theme, mediaElement, mediaPackage);
  }

  return (
    <>
      <h4 className="text-lg font-medium mb-1">Embed your player</h4>

      {blocks.map((block, index) => (
        <Code
          key={`code-${index}`}
          className="mb-1"
          lang={block.lang}
          code={[].concat(block.code).join('\n')}
        />
      ))}
    </>
  );
}

function jsCode(theme: string, mediaElement: any, mediaPackage: string) {
  let imports = [];
  let themeTag = `media-theme-${theme}`;
  let mediaTag: string = mediaElement.tag;

  if (mediaElement.tag.includes('-')) {
    imports.push(`import '${mediaPackage}';`);
  }

  imports.push(`import 'player.style/${theme}';`);

  return [
    {
      lang: 'js',
      code: [
        ...imports,
        '',
        `const template = document.createElement('template');
template.innerHTML = \`
  <${themeTag}>
    <${mediaTag}
      slot="media"
      src="${mediaElement.src}"
    ></${mediaTag}>
  </${themeTag}>\`;

document.body.append(template.content);`,
      ],
    },
  ];
}

function htmlCode(theme: string, mediaElement: any, mediaPackage: string) {
  let pkgs = [];
  let themeTag = `media-theme-${theme}`;
  let mediaTag: string = mediaElement.tag;

  if (mediaElement.tag.includes('-')) {
    pkgs.push(mediaPackage);
  }

  pkgs.push(`player.style/${theme}`);

  return [
    {
      lang: 'js',
      code: [
        ...pkgs.map(
          (pkg) => `<script type="module" src="https://cdn.jsdelivr.net/npm/${pkg}/+esm"></script>`
        ),
        '',
        `<${themeTag}>
  <${mediaTag}
    slot="media"
    src="${mediaElement.src}"
  ></${mediaTag}>
</${themeTag}>`,
      ],
    },
  ];
}

function reactCode(theme: string, mediaElement: any, mediaPackage: string) {
  let imports = [];
  let themeTag = `media-theme-${theme}`;
  let mediaTag: string = mediaElement.tag;

  if (mediaElement.tag.includes('-')) {
    mediaTag = pascalCase(mediaElement.tag);
    imports.push(`import ${mediaTag} from '${mediaPackage}';`);
  }

  themeTag = pascalCase(themeTag);
  imports.push(`import ${themeTag} from 'player.style/${theme}/react';`);

  return [
    {
      lang: 'jsx',
      code: [
        ...imports,
        '',
        `export default function Player() {
  return (
    <${themeTag}>
      <${mediaTag}
        slot="media"
        src="${mediaElement.src}"
      ></${mediaTag}>
    </${themeTag}>
  );
}`,
      ],
    },
  ];
}

function vueCode(theme: string, mediaElement: any, mediaPackage: string) {
  let imports = [];
  let themeTag = `media-theme-${theme}`;
  let mediaTag: string = mediaElement.tag;

  if (mediaElement.tag.includes('-')) {
    imports.push(`import '${mediaPackage}';`);
  }

  imports.push(`import 'player.style/${theme}';`);

  return [
    {
      lang: 'vue',
      code: [
        `<script setup>
${imports.join('\n').replace(/^(.)/gm, '  $1')}
</script>`,
        '',
        `<template>
  <${themeTag}>
    <${mediaTag}
      slot="media"
      src="${mediaElement.src}"
    ></${mediaTag}>
  </${themeTag}>
</template>`,
      ],
    },
  ];
}

function svelteCode(theme: string, mediaElement: any, mediaPackage: string) {
  let imports = [];
  let themeTag = `media-theme-${theme}`;
  let mediaTag: string = mediaElement.tag;

  if (mediaElement.tag.includes('-')) {
    imports.push(`import '${mediaPackage}';`);
  }

  imports.push(`import 'player.style/${theme}';`);

  return [
    {
      lang: 'svelte',
      code: [
        `<script>
${imports.join('\n').replace(/^(.)/gm, '  $1')}
</script>`,
        '',
        `<${themeTag}>
  <${mediaTag}
    slot="media"
    src="${mediaElement.src}"
  ></${mediaTag}>
</${themeTag}>`,
      ],
    },
  ];
}

function pascalCase(str: string) {
  return `-${str}`.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}
