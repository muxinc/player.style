import { getOpenEditionFiles } from '@/lib/open-editions';
import type { Renderer } from '@/lib/presets';
import { FRAMEWORK_PARAM, INSTALL_PARAM, MEDIA_PARAM, type SearchParamsInput } from '@/lib/search-params';
import { getDefaultUseCase, getThirdPartyPackage, type ThirdPartySkin, type UseCase } from '@/lib/skins';
import {
  DEFAULT_FRAMEWORK,
  DEFAULT_INSTALL_KIND,
  FRAMEWORKS,
  getThirdPartyMediaOptions,
  INSTALL_KINDS,
  type Framework,
  type InstallKind,
} from '@/lib/third-party-usage';

import InlineCode from './InlineCode';
import { getFrameworkMedia, getInstallMedia, getRendererMedia } from './option-media';
import OptionGroup from './OptionGroup';
import ThirdPartySnippets from './ThirdPartySnippets';
import { textLink } from './ui';

type ThirdPartyInstallSectionProps = {
  skin: ThirdPartySkin;
  /** The use case the page's picker holds: it picks the package, the preset's media list, and the open files. */
  useCase: UseCase;
  framework: Framework;
  renderer: Renderer;
  install: InstallKind;
  /** The page's search params, which every picker link keeps. */
  searchParams: SearchParamsInput;
};

/**
 * The classic player.style install flow: pick the media, the framework, and packaged or open, then copy the install
 * line and the code. Every pick is a link that rewrites the URL, so each combination is server-rendered and shareable.
 */
export default function ThirdPartyInstallSection({
  skin,
  useCase,
  framework,
  renderer,
  install,
  searchParams,
}: ThirdPartyInstallSectionProps) {
  const pathname = `/skins/${skin.slug}`;
  const mediaOptions = getThirdPartyMediaOptions(skin, useCase);
  const { package: pkg } = getThirdPartyPackage(skin, useCase);
  const sibling = useCase === getDefaultUseCase(skin) ? undefined : skin.package;
  const openFiles = install === 'open' ? getOpenEditionFiles(skin, useCase) : undefined;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-12">
      <div className="flex min-w-0 flex-col gap-8">
        <OptionGroup
          label="Media"
          param={MEDIA_PARAM}
          options={mediaOptions}
          value={renderer}
          defaultValue={mediaOptions[0]!.id}
          pathname={pathname}
          searchParams={searchParams}
          media={getRendererMedia}
        />
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
          label="Install"
          param={INSTALL_PARAM}
          options={INSTALL_KINDS}
          value={install}
          defaultValue={DEFAULT_INSTALL_KIND}
          pathname={pathname}
          searchParams={searchParams}
          media={getInstallMedia}
        />
        <p className="text-p2 text-pretty">
          Ships as <InlineCode>{pkg}</InlineCode> on npm, alongside the Video.js 10 package for your framework.
          {sibling && (
            <>
              {' '}
              The live video skin is its own package beside <InlineCode>{sibling}</InlineCode>, with a Live button in
              place of the time controls.
            </>
          )}
          {skin.legacy && (
            <>
              {' '}
              Ported from the{' '}
              <a className={textLink} href={skin.legacy.url} target="_blank" rel="noreferrer">
                Media Chrome edition
              </a>
              .
            </>
          )}
        </p>
      </div>
      <div className="flex min-w-0 flex-col gap-6">
        <ThirdPartySnippets
          skin={skin}
          useCase={useCase}
          framework={framework}
          renderer={renderer}
          install={install}
          openFiles={openFiles}
        />
      </div>
    </div>
  );
}
