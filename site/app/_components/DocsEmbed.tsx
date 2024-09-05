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
    case 'react':
      blocks = reactCode(name, mediaElement, mediaPackage, customProperties, embed, theme);
      break;
    case 'vue':
      blocks = vueCode(name, mediaElement, mediaPackage, customProperties, embed, theme);
      break;
    case 'svelte':
      blocks = svelteCode(name, mediaElement, mediaPackage, customProperties, embed, theme);
      break;
    case 'html':
      blocks = htmlCode(name, mediaElement, mediaPackage, customProperties, embed, theme);
      break;
    default:
      blocks = jsCode(name, mediaElement, mediaPackage, customProperties, embed, theme);
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

function jsCode(
  name: string,
  mediaElement: any,
  mediaPackage: string,
  customProperties: CustomProperties,
  embed: string,
  theme: any
) {
  let imports = [];
  let themeTag = `media-theme-${name}`;
  let mediaTag: string = mediaElement.tag;
  let attrs: Record<string, any> = {};
  let templateHtml = '';

  if (mediaElement.tag.includes('-')) {
    imports.push(`import '${mediaPackage}';`);
  }

  if (embed === 'template') {
    attrs.template = `media-theme-${name}`;
    themeTag = 'media-theme';

    imports.push(`import 'media-chrome';`);
    imports.push(`import 'media-chrome/menu';`);
    imports.push(`import 'media-chrome/media-theme-element';`);

    templateHtml = `<template id="media-theme-${name}">
${theme.templates.html.content.replace(/^(.)/gm, '    $1')}  </template>\n\n  `;
  } else {
    imports.push(`import 'player.style/${name}';`);
  }

  attrs.style = getCustomPropertiesStyle(customProperties);

  return [
    {
      lang: 'js',
      code: [
        ...imports,
        '',
        `const template = document.createElement('template');
template.innerHTML = \`
  ${templateHtml}<${themeTag}${getIndentedAttributes(attrs, 2)}>
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

function htmlCode(
  name: string,
  mediaElement: any,
  mediaPackage: string,
  customProperties: CustomProperties,
  embed: string,
  theme: any
) {
  let pkgs = [];
  let themeTag = `media-theme-${name}`;
  let mediaTag: string = mediaElement.tag;
  let attrs: Record<string, any> = {};
  let templateHtml = '';

  if (mediaElement.tag.includes('-')) {
    pkgs.push(mediaPackage);
  }

  if (embed === 'template') {
    attrs.template = `media-theme-${name}`;
    themeTag = 'media-theme';

    pkgs.push(`media-chrome`);
    pkgs.push(`media-chrome/menu`);
    pkgs.push(`media-chrome/media-theme-element`);

    templateHtml = `\n<template id="media-theme-${name}">
${theme.templates.html.content.replace(/^(.)/gm, '  $1')}</template>\n  `;
  } else {
    pkgs.push(`player.style/${name}`);
  }

  attrs.style = getCustomPropertiesStyle(customProperties);

  return [
    {
      lang: 'js',
      code: [
        ...pkgs.map(
          (pkg) => `<script type="module" src="https://cdn.jsdelivr.net/npm/${pkg}/+esm"></script>`
        ),
        templateHtml,
        `<${themeTag}${getIndentedAttributes(attrs)}>
  <${mediaTag}
    slot="media"
    src="${mediaElement.src}"
  ></${mediaTag}>
</${themeTag}>`,
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
  let themeTag = `media-theme-${name}`;
  let mediaTag: string = mediaElement.tag;
  let props = '';
  let templateHtml = '';

  if (mediaElement.tag.includes('-')) {
    mediaTag = pascalCase(mediaElement.tag);
    imports.push(`import ${mediaTag} from '${mediaPackage}';`);
  }

  if (embed === 'template') {
    props += `\n        template="media-theme-${name}"`;
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
    props += `\n        style={{ ${customPropertiesStyleReact.trim()} }}`;
  }

  if (props.length) props += '\n      ';

  return [
    {
      lang: 'jsx',
      code: [
        ...imports,
        '',
        `export default function Player() {
  return (
    <>
      ${templateHtml}<${themeTag}${props}>
        <${mediaTag}
          slot="media"
          src="${mediaElement.src}"
        ></${mediaTag}>
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
  let themeTag = `media-theme-${name}`;
  let mediaTag: string = mediaElement.tag;
  let attrs: Record<string, any> = {};
  let templateHtml = '';

  if (mediaElement.tag.includes('-')) {
    imports.push(`import '${mediaPackage}';`);
  }

  if (embed === 'template') {
    attrs.id = `media-theme-${name}`;
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

  attrs.style = getCustomPropertiesStyle(customProperties);

  return [
    {
      lang: 'vue',
      code: [
        `<script setup>
${imports.join('\n').replace(/^(.)/gm, '  $1')}${templateHtml}
</script>`,
        '',
        `<template>
  <${themeTag}${getIndentedAttributes(attrs, 2)}>
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

function svelteCode(
  name: string,
  mediaElement: any,
  mediaPackage: string,
  customProperties: CustomProperties,
  embed: string,
  theme: any
) {
  let imports = [];
  let themeTag = `media-theme-${name}`;
  let mediaTag: string = mediaElement.tag;
  let attrs: Record<string, any> = {};
  let templateHtml = '';

  if (mediaElement.tag.includes('-')) {
    imports.push(`import '${mediaPackage}';`);
  }

  if (embed === 'template') {
    attrs.id = `media-theme-${name}`;
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

  attrs.style = getCustomPropertiesStyle(customProperties);

  return [
    {
      lang: 'svelte',
      code: [
        `<script>
${imports.join('\n').replace(/^(.)/gm, '  $1')}${templateHtml}
</script>`,
        '',
        `<${themeTag}${getIndentedAttributes(attrs)}>
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
  return customPropertiesStyle;
}

function getIndentedAttributes(attrs: Record<string, any>, indent = 0) {
  let output = '';
  const attrSpaces = ' '.repeat(indent + 2);
  const nextLineSpaces = ' '.repeat(indent);
  for (const [attr, value] of Object.entries(attrs)) {
    if (value.trim()) {
      output += `\n${attrSpaces}${attr}="${value.trim()}"`;
    }
  }
  return output ? `${output}\n${nextLineSpaces}` : '';
}
