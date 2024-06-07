import Code from './Code';
import mediaElements from '@/media-elements';

type DocsInstallProps = {
  searchParams: Record<string, string | string[]>;
  theme: string;
};

const importsPerFramework = (theme: string) => ({
  html: [`import 'media-chrome';`, `import 'media-chrome/dist/themes/${theme}.js';`],
  react: [`import 'media-chrome/react';`, `import 'media-chrome/dist/themes/${theme}.js';`],
});

type FrameworkType = 'html' | 'react';

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

  const imports = importsPerFramework(theme)[framework as FrameworkType];

  let componentTag: string = mediaElement.tag;
  let lang = 'html';

  if (framework === 'react') {
    lang = 'jsx';

    if (mediaElement.tag.includes('-')) {
      componentTag = pascalCase(mediaElement.tag);
      imports.unshift(`import ${componentTag} from '${mediaPackage}';\n`);
    }
  } else {
    if (mediaElement.tag.includes('-')) {
      imports.unshift(`import '${mediaPackage}';\n`);
    }
  }

  return (
    <>
      <Code className="mb-1" lang="js" code={imports.map((item: string) => item).join('\n')} />
      <Code
        lang={lang}
        code={`<media-theme-${theme}>
  <${componentTag}
    slot="media"
    src="${mediaElement.src}"
  ></${componentTag}>
</media-theme-${theme}>`}
      />
    </>
  );
}

function pascalCase(str: string) {
  return `-${str}`.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}
