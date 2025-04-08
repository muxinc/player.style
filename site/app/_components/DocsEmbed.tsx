import Code from './Code';
import mediaElements from '@/media-elements';
import { findParam } from '@/app/_utils/utils';

type DocsInstallProps = {
  searchParams: Record<string, string | string[]>;
  name: string;
  theme: any;
};

export default async function DocsEmbed(props: DocsInstallProps) {
  const { searchParams, name, theme } = props;

  const media = findParam(searchParams, 'media') || 'video';
  const mediaElement = mediaElements[media as keyof typeof mediaElements];

  const framework = findParam(searchParams, 'framework') || 'html';
  const mediaPackage =
    mediaElement.package?.[framework as keyof typeof mediaElement.package] ??
    (mediaElement.package?.default as string);

  const customProperties: CustomProperties = {
    '--media-primary-color': findParam(searchParams, 'primary-color'),
    '--media-secondary-color': findParam(searchParams, 'secondary-color'),
    '--media-accent-color': findParam(searchParams, 'accent-color'),
  };

  const embed = findParam(searchParams, 'embed') ?? 'packaged';

  let blocks: any[] = [];
  switch (framework) {
    case 'js':
      blocks = jsCode(name, mediaElement, mediaPackage, customProperties, embed, theme);
      break;
    case 'react':
      blocks = reactCode(name, mediaElement, mediaPackage, customProperties, embed, theme);
      break;
    case 'vue':
      blocks = vueCode(name, mediaElement, mediaPackage, customProperties, embed, theme);
      break;
    case 'lit':
      blocks = litCode(name, mediaElement, mediaPackage, customProperties, embed, theme);
      break;
    case 'svelte':
      blocks = svelteCode(name, mediaElement, mediaPackage, customProperties, embed, theme);
      break;
    default:
      blocks = htmlCode(name, mediaElement, mediaPackage, customProperties, embed, theme);
  }

  return (
    <>
      <h4 className="text-lg font-medium mb-0">Embed your player</h4>
      <p className="mb-1" style={{color: "#777"}}>Copy and paste the code below into a page in your project.</p>

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

function htmlCode(
  name: string,
  mediaElement: any,
  mediaPackage: string,
  customProperties: CustomProperties,
  embed: string,
  theme: any
) {
  let pkgs = [];
  let templateHtml = '';

  let themeTag = `media-theme-${name}`;
  let themeAttrs: Record<string, any> = {};

  const mediaTag: string = mediaElement.tag;
  const mediaAttrs = getMediaAttributes(mediaElement);

  if (mediaElement.tag.includes('-')) {
    pkgs.push(mediaPackage);
  }

  if (embed === 'template') {
    themeAttrs.template = `media-theme-${name}`;
    themeTag = 'media-theme';

    pkgs.push(`media-chrome`);
    pkgs.push(`media-chrome/menu`);
    pkgs.push(`media-chrome/media-theme-element`);

    templateHtml = `\n<template id="media-theme-${name}">
${theme.templates.html.content.replace(/^(.)/gm, '  $1')}</template>\n  `;
  } else {
    pkgs.push(`player.style/${name}`);
  }

  themeAttrs.style = getCustomPropertiesStyle(customProperties);

  return [
    {
      lang: 'js',
      code: [
        ...pkgs.map(
          (pkg) => `<script type="module" src="https://cdn.jsdelivr.net/npm/${pkg}/+esm"></script>`
        ),
        templateHtml,
        `<${themeTag}${getIndentedAttributes(themeAttrs)} style="width:100%">
  <${mediaTag}${getIndentedAttributes(mediaAttrs, 2)}></${mediaTag}>
</${themeTag}>`,
      ],
    },
  ];
}

function jsCode(
  name: string,
  mediaElement: any,
  mediaPackage: string,
  customProperties: CustomProperties,
  embed: string,
  theme: any
) {
  let imports = [];
  let templateHtml = '';

  let themeTag = `media-theme-${name}`;
  let themeAttrs: Record<string, any> = {};

  const mediaTag: string = mediaElement.tag;
  const mediaAttrs = getMediaAttributes(mediaElement);

  if (mediaElement.tag.includes('-')) {
    imports.push(`import '${mediaPackage}';`);
  }

  if (embed === 'template') {
    themeAttrs.template = `media-theme-${name}`;
    themeTag = 'media-theme';

    imports.push(`import 'media-chrome';`);
    imports.push(`import 'media-chrome/menu';`);
    imports.push(`import 'media-chrome/media-theme-element';`);

    templateHtml = `<template id="media-theme-${name}">
${theme.templates.html.content.replace(/^(.)/gm, '    $1')}  </template>\n\n  `;
  } else {
    imports.push(`import 'player.style/${name}';`);
  }

  themeAttrs.style = getCustomPropertiesStyle(customProperties);

  return [
    {
      lang: 'js',
      code: [
        ...imports,
        '',
        `const template = document.createElement('template');
template.innerHTML = \`
  ${templateHtml}<${themeTag}${getIndentedAttributes(themeAttrs, 2)} style="width: 100%">
    <${mediaTag}${getIndentedAttributes(mediaAttrs, 4)}></${mediaTag}>
  </${themeTag}>\`;

document.body.append(template.content);`,
      ],
    },
  ];
}

function reactCode(
  name: string,
  mediaElement: any,
  mediaPackage: string,
  customProperties: CustomProperties,
  embed: string,
  theme: any
) {
  let imports = [];
  let templateHtml = '';

  let themeTag = `media-theme-${name}`;
  let themeAttrs = '';

  let mediaTag: string = mediaElement.tag;
  const mediaAttrs = attrsToJSXProps(getMediaAttributes(mediaElement));

  if (mediaElement.tag.includes('-')) {
    mediaTag = pascalCase(mediaElement.tag);
    imports.push(`import ${mediaTag} from '${mediaPackage}';`);
  }

  if (embed === 'template') {
    themeAttrs += `\n        template="media-theme-${name}"`;
    themeTag = 'media-theme';

    imports.push(`import 'media-chrome/react';`);
    imports.push(`import 'media-chrome/react/menu';`);
    imports.push(`import { MediaTheme } from 'media-chrome/react/media-theme';`);

    templateHtml = `<template
        id="media-theme-${name}"
        dangerouslySetInnerHTML={{ __html: \`
${theme.templates.html.content.trim().replace(/^(.)/gm, '          $1')}\` }}
      />\n\n      `;
  }

  themeTag = pascalCase(themeTag);

  if (embed !== 'template') {
    imports.push(`import ${themeTag} from 'player.style/${name}/react';`);
  }

  let customPropertiesStyleReact = '';
  let filteredCustomProperties = Object.entries(customProperties).filter(([_, value]) =>
    Boolean(value)
  );
  filteredCustomProperties.forEach(([property, value], index) => {
    if (value) {
      const trailingComma = index < filteredCustomProperties.length - 1 ? ', ' : ' ';
      customPropertiesStyleReact += `"${property}": "#${value}"${trailingComma}`;
    }
  });
  if (customPropertiesStyleReact.length) {
    themeAttrs += `\n        style={{ ${customPropertiesStyleReact.trim()} }}`;
  }

  if (themeAttrs.length) themeAttrs += '\n      ';

  return [
    {
      lang: 'jsx',
      code: [
        ...imports,
        '',
        `export default function Page() {
  return (
    <>
      ${templateHtml}<${themeTag}${themeAttrs} style={{width: "100%"}}>
        <${mediaTag}${getIndentedAttributes(mediaAttrs, 8)}></${mediaTag}>
      </${themeTag}>
    </>
  );
}`,
      ],
    },
  ];
}

function vueCode(
  name: string,
  mediaElement: any,
  mediaPackage: string,
  customProperties: CustomProperties,
  embed: string,
  theme: any
) {
  let imports = [];
  let templateHtml = '';

  let themeTag = `media-theme-${name}`;
  let themeAttrs: Record<string, any> = {};

  const mediaTag: string = mediaElement.tag;
  const mediaAttrs = getMediaAttributes(mediaElement);

  if (mediaElement.tag.includes('-')) {
    imports.push(`import '${mediaPackage}';`);
  }

  if (embed === 'template') {
    themeAttrs.id = `media-theme-${name}`;
    themeTag = 'media-theme';

    imports.push(`import { onMounted } from 'vue';`);
    imports.push(`import 'media-chrome';`);
    imports.push(`import 'media-chrome/menu';`);
    imports.push(`import 'media-chrome/media-theme-element';`);

    templateHtml = `\n
  onMounted(() => {
    const template = document.createElement('template');
    template.innerHTML = \`
${theme.templates.html.content.replace(/^(.)/gm, '      $1')}    \`;

    document.querySelector('#media-theme-${name}').template = template;
  });`;
  } else {
    imports.push(`import 'player.style/${name}';`);
  }

  themeAttrs.style = getCustomPropertiesStyle(customProperties);

  return [
    {
      lang: 'vue',
      code: [
        `<script setup>
${imports.join('\n').replace(/^(.)/gm, '  $1')}${templateHtml}
</script>`,
        '',
        `<template>
  <${themeTag}${getIndentedAttributes(themeAttrs, 2)} :style="{ width: '100%' }">
    <${mediaTag}${getIndentedAttributes(mediaAttrs, 4)}></${mediaTag}>
  </${themeTag}>
</template>`,
      ],
    },
  ];
}

function litCode(
  name: string,
  mediaElement: any,
  mediaPackage: string,
  customProperties: CustomProperties,
  embed: string,
  theme: any
) {
  let imports = [];
  let templateHtml = '';

  let themeTag = `media-theme-${name}`;
  let themeAttrs: Record<string, any> = {};

  const mediaTag: string = mediaElement.tag;
  const mediaAttrs = getMediaAttributes(mediaElement);

  if (mediaElement.tag.includes('-')) {
    imports.push(`import '${mediaPackage}';`);
  }

  imports.push(`import { LitElement, html } from 'lit';`);

  if (embed === 'template') {
    themeAttrs.template = `media-theme-${name}`;
    themeTag = 'media-theme';

    imports.push(`import 'media-chrome';`);
    imports.push(`import 'media-chrome/menu';`);
    imports.push(`import 'media-chrome/media-theme-element';`);

    templateHtml = `<template id="media-theme-${name}">
${theme.templates.html.content.replace(/^(.)/gm, '        $1')}      </template>\n\n      `;
  } else {
    imports.push(`import 'player.style/${name}';`);
  }

  themeAttrs.style = `width: 100%; height: 100%; ${getCustomPropertiesStyle(customProperties) ?? ''}`;

  return [
    {
      lang: 'js',
      code: [
        ...imports,
        '',
        `class MyPage extends LitElement {
  render() {
    return html\`
      ${templateHtml}<${themeTag}${getIndentedAttributes(themeAttrs, 6)}>
        <${mediaTag}${getIndentedAttributes(mediaAttrs, 8)}></${mediaTag}>
      </${themeTag}>\`;
  }
}

customElements.define('my-page', MyPage);`,
      ],
    },
  ];
}

function svelteCode(
  name: string,
  mediaElement: any,
  mediaPackage: string,
  customProperties: CustomProperties,
  embed: string,
  theme: any
) {
  let imports = [];
  let templateHtml = '';

  let themeTag = `media-theme-${name}`;
  let themeAttrs: Record<string, any> = {};

  const mediaTag: string = mediaElement.tag;
  const mediaAttrs = getMediaAttributes(mediaElement);

  if (mediaElement.tag.includes('-')) {
    imports.push(`import '${mediaPackage}';`);
  }

  if (embed === 'template') {
    themeAttrs.id = `media-theme-${name}`;
    themeTag = 'media-theme';

    imports.push(`import { onMount } from 'svelte';`);
    imports.push(`import 'media-chrome';`);
    imports.push(`import 'media-chrome/menu';`);
    imports.push(`import 'media-chrome/media-theme-element';`);

    templateHtml = `\n
  onMount(() => {
    const template = document.createElement('template');
    template.innerHTML = \`
${theme.templates.html.content.replace(/^(.)/gm, '      $1')}    \`;

    document.querySelector('#media-theme-${name}').template = template;
  });`;
  } else {
    imports.push(`import 'player.style/${name}';`);
  }

  themeAttrs.style = getCustomPropertiesStyle(customProperties);

  return [
    {
      lang: 'svelte',
      code: [
        `<script>
${imports.join('\n').replace(/^(.)/gm, '  $1')}${templateHtml}
</script>`,
        '',
        `<${themeTag}${getIndentedAttributes(themeAttrs)} style="width: 100%;">
  <${mediaTag}${getIndentedAttributes(mediaAttrs, 2)}></${mediaTag}>
</${themeTag}>`,
      ],
    },
  ];
}

function pascalCase(str: string) {
  return `-${str}`.replace(/-(\w)/g, (g) => g[1].toUpperCase());
}

function camelCase(str: string) {
  return `${str}`.replace(/-(\w)/g, (g) => g[1].toUpperCase());
}

function getMediaAttributes(mediaElement: any) {
  let mediaAttrs: Record<string, any> = {
    slot: 'media',
  };

  if (mediaElement.tag === 'mux-video') {
    mediaAttrs['playback-id'] = mediaElement.playbackId;
  } else {
    mediaAttrs.src = mediaElement.src;
  }

  mediaAttrs.playsinline = '';
  mediaAttrs.crossorigin = '';

  return mediaAttrs;
}

const attrsToJSXPropsMap: Record<string, string> = {
  'playsinline': 'playsInline',
  'crossorigin': 'crossOrigin',
};

function attrsToJSXProps(attrs: Record<string, any>) {
  let props: Record<string, any> = {};
  for (const [attr, value] of Object.entries(attrs)) {
    delete attrs[attr];
    const prop = attrsToJSXPropsMap[attr] ?? camelCase(attr);
    props[prop] = value;
  }
  return props;
}

type CustomProperties = {
  '--media-primary-color'?: string;
  '--media-secondary-color'?: string;
  '--media-accent-color'?: string;
};

function getCustomPropertiesStyle(customProperties: CustomProperties) {
  let customPropertiesStyle = '';
  Object.entries(customProperties).forEach(([property, value]) => {
    if (value) {
      customPropertiesStyle += `${property}: #${value}; `;
    }
  });
  if (customPropertiesStyle) {
    return customPropertiesStyle;
  }
}

function getIndentedAttributes(attrs: Record<string, any>, indent = 0) {
  let output = '';
  const attrSpaces = ' '.repeat(indent + 2);
  const nextLineSpaces = ' '.repeat(indent);
  for (const [attr, value] of Object.entries(attrs)) {
    if (value != null) {
      if (value.trim()) {
        output += `\n${attrSpaces}${attr}="${value.trim()}"`;
      } else {
        output += `\n${attrSpaces}${attr}`;
      }
    }
  }
  return output ? `${output}\n${nextLineSpaces}` : '';
}
