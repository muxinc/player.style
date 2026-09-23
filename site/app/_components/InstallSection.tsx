'use client';

import { useSearchParams } from 'next/navigation';

import {
  buildInstallationUrl,
  DEFAULT_FRAMEWORK,
  FRAMEWORKS,
  getMediaOptions,
  getUsageNames,
  isFramework,
  resolveMedia,
  usesHtmlElements,
} from '@/lib/installation-url';
import { FRAMEWORK_PARAM, MEDIA_PARAM } from '@/lib/search-params';
import type { FirstPartySkin } from '@/lib/skins';

import CodeLine from './CodeLine';
import OptionGroup from './OptionGroup';

export default function InstallSection({ skin }: { skin: FirstPartySkin }) {
  const searchParams = useSearchParams();
  const frameworkParam = searchParams.get(FRAMEWORK_PARAM);
  const framework = isFramework(frameworkParam) ? frameworkParam : DEFAULT_FRAMEWORK;
  const mediaOptions = getMediaOptions(skin);
  const media = resolveMedia(skin, searchParams.get(MEDIA_PARAM));
  const href = buildInstallationUrl(skin, framework, media);
  const names = getUsageNames(skin);

  const usage = usesHtmlElements(framework)
    ? {
        label: 'HTML',
        code: `<${names.html.player}><${names.html.skin}>…</${names.html.skin}></${names.html.player}>`,
      }
    : {
        label: 'React',
        code: `import { ${names.react.player}, ${names.react.skin}, ${names.react.media} } from '${names.react.entry}'`,
      };

  return (
    <div className="grid gap-1 px-1 py-1 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-2 md:px-2">
      <div className="flex min-w-0 flex-col gap-0.75">
        <OptionGroup
          label="Framework"
          param={FRAMEWORK_PARAM}
          options={FRAMEWORKS}
          value={framework}
          defaultValue={DEFAULT_FRAMEWORK}
        />
        <OptionGroup
          label="Media"
          param={MEDIA_PARAM}
          options={mediaOptions}
          value={media}
          defaultValue={mediaOptions[0]!.id}
        />
      </div>
      <div className="flex min-w-0 flex-col gap-0.75">
        <div className="flex flex-col items-start gap-0.5">
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="border-blue-dark bg-blue text-md hover:bg-blue-core focus-visible:bg-blue-core inline-flex items-center gap-0.25 rounded-full border px-1 py-0.5 font-bold text-white"
          >
            Get installation instructions on videojs.org ↗
          </a>
          <p className="text-gray-dark text-sm leading-normal">
            You’ll pick your package manager and paste your own media URL there.
          </p>
        </div>
        <CodeLine label={`${usage.label} usage`} code={usage.code} />
      </div>
    </div>
  );
}
