import { getOpenEditionFiles } from '@/lib/open-editions';
import type { Renderer } from '@/lib/presets';
import { FRAMEWORK_PARAM, INSTALL_PARAM, MEDIA_PARAM, type SearchParamsInput } from '@/lib/search-params';
import { getBaseSkin, type ThirdPartySkin } from '@/lib/skins';
import {
  DEFAULT_FRAMEWORK,
  DEFAULT_INSTALL_KIND,
  FRAMEWORKS,
  getThirdPartyMediaOptions,
  INSTALL_KINDS,
  type Framework,
  type InstallKind,
} from '@/lib/third-party-usage';

import AccentLink from './AccentLink';
import InlineCode from './InlineCode';
import { getFrameworkMedia, getInstallMedia, getRendererMedia } from './option-media';
import OptionGroup from './OptionGroup';
import ThirdPartySnippets from './ThirdPartySnippets';
import { textLink } from './ui';

type ThirdPartyInstallSectionProps = {
  skin: ThirdPartySkin;
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
  framework,
  renderer,
  install,
  searchParams,
}: ThirdPartyInstallSectionProps) {
  const pathname = `/skins/${skin.slug}`;
  const mediaOptions = getThirdPartyMediaOptions(skin);
  const base = skin.edition === 'live' ? getBaseSkin(skin) : undefined;
  const openFiles = install === 'open' ? getOpenEditionFiles(skin) : undefined;

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
          Ships as <InlineCode>{skin.package}</InlineCode> on npm, alongside the Video.js 10 package for your framework.
          {base && (
            <>
              {' '}
              The live edition of{' '}
              <AccentLink href={`/skins/${base.slug}`} className={textLink}>
                {base.title}
              </AccentLink>
              , published as its own package.
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
          framework={framework}
          renderer={renderer}
          install={install}
          openFiles={openFiles}
        />
      </div>
    </div>
  );
}
