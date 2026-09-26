import { ACCENT_SENTINEL } from '@/lib/code-snippet';
import { highlightAccentCode, highlightCode } from '@/lib/highlight';
import type { Renderer } from '@/lib/presets';
import { REGISTRY_FRAMEWORK_LABELS, REGISTRY_PACKAGES } from '@/lib/registry';
import {
  FRAMEWORK_PARAM,
  INSTALL_PARAM,
  MEDIA_PARAM,
  USE_CASE_PARAM,
  type SearchParamsInput,
} from '@/lib/search-params';
import { getShadcnInstall } from '@/lib/shadcn-install';
import { getDefaultUseCase, type ThirdPartySkin, type UseCase } from '@/lib/skins';
import {
  DEFAULT_FRAMEWORK,
  DEFAULT_INSTALL_KIND,
  FRAMEWORKS,
  getThirdPartyInstallCommand,
  getThirdPartyMediaOptions,
  getThirdPartySnippets,
  getUseCaseHref,
  getUseCaseOptions,
  INSTALL_KINDS,
  type Framework,
  type InstallKind,
  type UsageSelection,
} from '@/lib/third-party-usage';

import { getFrameworkMedia, getInstallMedia, getRendererMedia, getUseCaseMedia } from './option-media';
import OptionGroup from './OptionGroup';
import ShadcnInstall from './ShadcnInstall';
import ThirdPartySnippets, { type AccentSnippetBlock } from './ThirdPartySnippets';

type ThirdPartyInstallSectionProps = {
  skin: ThirdPartySkin;
  /** The use case the page's picker holds: it picks the package, the preset's media list, and the registry item. */
  useCase: UseCase;
  framework: Framework;
  renderer: Renderer;
  install: InstallKind;
  /** The page's search params, which every picker link keeps. */
  searchParams: SearchParamsInput;
};

/**
 * The usage blocks for a selection, highlighted without an accent and with the sentinel one, so the client can follow
 * the accent picker without asking the server again.
 */
async function getAccentBlocks(
  skin: ThirdPartySkin,
  useCase: UseCase,
  selection: UsageSelection
): Promise<AccentSnippetBlock[]> {
  const plain = getThirdPartySnippets(skin, useCase, selection);
  const accented = getThirdPartySnippets(skin, useCase, { ...selection, accent: ACCENT_SENTINEL });

  return Promise.all(
    plain.map(async (block, blockIndex) => ({
      label: block.label,
      files: await Promise.all(
        block.files.map(async (file, fileIndex) => ({
          name: file.name,
          code: await highlightAccentCode(file.code, accented[blockIndex]!.files[fileIndex]!.code, file.lang),
        }))
      ),
    }))
  );
}

async function ShadcnSteps({
  skin,
  useCase,
  framework,
}: Pick<ThirdPartyInstallSectionProps, 'skin' | 'useCase' | 'framework'>) {
  const install = getShadcnInstall(skin, useCase, framework);
  const [runners, componentsJson, tsconfigPaths] = await Promise.all([
    Promise.all(
      install.commands.map(async (command) => ({
        name: command.name,
        namespaced: await highlightCode(command.namespaced, 'bash'),
        url: await highlightCode(command.url, 'bash'),
        maintain: await highlightCode(command.maintain, 'bash'),
      }))
    ),
    highlightCode(install.componentsJson, 'json'),
    highlightCode(install.tsconfigPaths, 'json'),
  ]);

  return (
    <ShadcnInstall
      item={install.item}
      catalog={REGISTRY_FRAMEWORK_LABELS[install.registryFramework]}
      dependency={REGISTRY_PACKAGES[install.registryFramework]}
      runners={runners}
      componentsJson={componentsJson}
      tsconfigPaths={tsconfigPaths}
      svelte={framework === 'svelte'}
    />
  );
}

/**
 * The classic player.style install flow: pick the use case (for a skin with a live package), the media, the framework,
 * and packaged or shadcn, then copy the install commands and the code. Every pick is a link that rewrites the URL, so
 * each combination is server-rendered, highlighted, and shareable.
 */
export default async function ThirdPartyInstallSection({
  skin,
  useCase,
  framework,
  renderer,
  install,
  searchParams,
}: ThirdPartyInstallSectionProps) {
  const pathname = `/skins/${skin.slug}`;
  const mediaOptions = getThirdPartyMediaOptions(skin, useCase);
  const selection = { framework, renderer, install };
  const command = getThirdPartyInstallCommand(skin, useCase, selection);
  const [blocks, installLine] = await Promise.all([
    getAccentBlocks(skin, useCase, selection),
    command ? highlightCode(command, 'bash') : undefined,
  ]);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-12">
      <div className="flex min-w-0 flex-col gap-8">
        {skin.useCases.length > 1 && (
          <OptionGroup
            label="Use case"
            param={USE_CASE_PARAM}
            options={getUseCaseOptions(skin)}
            value={useCase}
            defaultValue={getDefaultUseCase(skin)}
            pathname={pathname}
            searchParams={searchParams}
            media={getUseCaseMedia}
            hrefFor={(id) => getUseCaseHref(skin, id, searchParams)}
          />
        )}
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
      </div>
      <div className="flex min-w-0 flex-col gap-6">
        {install === 'shadcn' && <ShadcnSteps skin={skin} useCase={useCase} framework={framework} />}
        <ThirdPartySnippets
          install={installLine && { ...installLine, label: install === 'shadcn' ? 'Install the media' : 'Install' }}
          blocks={blocks}
        />
      </div>
    </div>
  );
}
