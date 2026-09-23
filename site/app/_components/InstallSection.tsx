import {
  buildInstallationUrl,
  DEFAULT_FRAMEWORK,
  FRAMEWORKS,
  getMediaOptions,
  getUsageSnippet,
  type Framework,
  type Renderer,
} from '@/lib/installation-url';
import { FRAMEWORK_PARAM, MEDIA_PARAM, type SearchParamsInput } from '@/lib/search-params';
import type { FirstPartySkin } from '@/lib/skins';

import CodeLine from './CodeLine';
import OptionGroup from './OptionGroup';

type InstallSectionProps = {
  skin: FirstPartySkin;
  framework: Framework;
  media: Renderer;
  /** The page's search params, which the framework and media links keep. */
  searchParams: SearchParamsInput;
};

const USAGE_NOTES: Partial<Record<Framework, string>> = {
  shadcn: 'The shadcn guide adds the skin’s source to your project, so there’s nothing to import from a package.',
  cdn: 'The CDN guide loads the player and skin with script tags.',
};

export default function InstallSection({ skin, framework, media, searchParams }: InstallSectionProps) {
  const pathname = `/skins/${skin.slug}`;
  const mediaOptions = getMediaOptions(skin);
  const href = buildInstallationUrl(skin, framework, media);
  const usage = getUsageSnippet(skin, framework);

  return (
    <div className="grid gap-1 px-1 py-1 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-2 md:px-2">
      <div className="flex min-w-0 flex-col gap-0.75">
        <OptionGroup
          label="Framework"
          param={FRAMEWORK_PARAM}
          options={FRAMEWORKS}
          value={framework}
          defaultValue={DEFAULT_FRAMEWORK}
          pathname={pathname}
          searchParams={searchParams}
        />
        <OptionGroup
          label="Media"
          param={MEDIA_PARAM}
          options={mediaOptions}
          value={media}
          defaultValue={mediaOptions[0]!.id}
          pathname={pathname}
          searchParams={searchParams}
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
        {usage ? (
          <CodeLine label={`${usage.label} usage`} code={usage.code} />
        ) : (
          <p className="text-md leading-normal tracking-wide text-pretty">{USAGE_NOTES[framework]}</p>
        )}
      </div>
    </div>
  );
}
