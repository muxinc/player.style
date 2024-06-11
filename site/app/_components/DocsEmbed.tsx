import Code from './Code';
import mediaElements from '@/media-elements';

type DocsInstallProps = {
  searchParams: Record<string, string | string[]>;
  theme: string;
};

export default async function DocsEmbed(props: DocsInstallProps) {
  const { searchParams, theme } = props;

  const media =
    (Array.isArray(searchParams.media) ? searchParams.media[0] : searchParams.media) ?? 'video';
  const mediaElement = mediaElements[media as keyof typeof mediaElements];

  const framework =
    (Array.isArray(searchParams.framework) ? searchParams.framework[0] : searchParams.framework) ??
    'html';
  const mediaPackage =
    mediaElement.package?.[framework as keyof typeof mediaElement.package] ??
    mediaElement.package?.default;

  let imports = [];

  let themeTag = `media-theme-${theme}`;
  let componentTag: string = mediaElement.tag;
  let lang = 'html';

  if (framework === 'react') {
    lang = 'jsx';

    if (mediaElement.tag.includes('-')) {
      componentTag = pascalCase(mediaElement.tag);
      imports.push(`import ${componentTag} from '${mediaPackage}';`);
    }

    themeTag = pascalCase(themeTag);
    imports.push(`import ${themeTag} from 'player.style/${theme}/react';`);

  } else {
    if (mediaElement.tag.includes('-')) {
      imports.push(`import '${mediaPackage}';`);
    }

    imports.push(`import 'player.style/${theme}';`);
  }

  return (
    <>
      <Code className="mb-1" lang="js" code={imports.map((item: string) => item).join('\n')} />
      <Code
        lang={lang}
        code={`<${themeTag}>
  <${componentTag}
    slot="media"
    src="${mediaElement.src}"
  ></${componentTag}>
</${themeTag}>`}
      />
    </>
  );
}

function pascalCase(str: string) {
  return `-${str}`.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}
