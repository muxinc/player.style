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
import ArrowUpRightIcon from './icons/ArrowUpRightIcon';
import { getFrameworkMedia, getRendererMedia } from './option-media';
import OptionGroup from './OptionGroup';
import { buttonPrimary } from './ui';

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
    <div className="grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-12">
      <div className="flex min-w-0 flex-col gap-8">
        <OptionGroup
          label="Framework"
          param={FRAMEWORK_PARAM}
          options={FRAMEWORKS}
          value={framework}
          defaultValue={DEFAULT_FRAMEWORK}
          pathname={pathname}
          searchParams={searchParams}
          media={getFrameworkMedia}
        />
        <OptionGroup
          label="Media"
          param={MEDIA_PARAM}
          options={mediaOptions}
          value={media}
          defaultValue={mediaOptions[0]!.id}
          pathname={pathname}
          searchParams={searchParams}
          media={getRendererMedia}
        />
      </div>
      <div className="flex min-w-0 flex-col gap-6">
        <div className="flex flex-col items-start gap-3">
          <a href={href} target="_blank" rel="noreferrer" className={buttonPrimary}>
            Get installation instructions on videojs.org
            <ArrowUpRightIcon className="size-4" />
          </a>
          <p className="text-p3 text-muted">You’ll pick your package manager and paste your own media URL there.</p>
        </div>
        {usage ? (
          <CodeLine label={`${usage.label} usage`} code={usage.code} />
        ) : (
          <p className="text-p2 text-pretty">{USAGE_NOTES[framework]}</p>
        )}
      </div>
    </div>
  );
}
