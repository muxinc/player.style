import { FRAMEWORK_PARAM, type SearchParamsInput } from '@/lib/search-params';
import type { SkinFramework, ThirdPartySkin } from '@/lib/skins';
import {
  getDefaultFramework,
  getThirdPartyInstallCommand,
  getThirdPartyUsageSnippet,
  THIRD_PARTY_FRAMEWORKS,
} from '@/lib/third-party-usage';

import CodeBlock from './CodeBlock';
import CodeLine from './CodeLine';
import OptionGroup from './OptionGroup';

type ThirdPartyInstallSectionProps = {
  skin: ThirdPartySkin;
  framework: SkinFramework;
  /** The page's search params, which the framework links keep. */
  searchParams: SearchParamsInput;
};

/** Package name, install line, and a pasteable player for each framework the skin ships. */
export default function ThirdPartyInstallSection({ skin, framework, searchParams }: ThirdPartyInstallSectionProps) {
  const options = THIRD_PARTY_FRAMEWORKS.filter((option) => skin.frameworks.includes(option.id));
  const label = options.find((option) => option.id === framework)?.label ?? framework;

  return (
    <div className="grid gap-1 px-1 py-1 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-2 md:px-2">
      <div className="flex min-w-0 flex-col gap-0.75">
        <OptionGroup
          label="Framework"
          param={FRAMEWORK_PARAM}
          options={options}
          value={framework}
          defaultValue={getDefaultFramework(skin)}
          pathname={`/skins/${skin.slug}`}
          searchParams={searchParams}
        />
        <p className="text-md leading-normal tracking-wide text-pretty">
          Ships as <code className="font-mono text-sm">{skin.package}</code> on npm, alongside the Video.js 10 package
          for your framework.
          {skin.legacy && (
            <>
              {' '}
              Ported from the{' '}
              <a
                className="underline decoration-1 underline-offset-[0.3em] hover:no-underline"
                href={skin.legacy.url}
                target="_blank"
                rel="noreferrer"
              >
                Media Chrome edition ↗
              </a>
              .
            </>
          )}
        </p>
      </div>
      <div className="flex min-w-0 flex-col gap-0.75">
        <CodeLine label="Install" code={getThirdPartyInstallCommand(skin, framework)} />
        <CodeBlock label={`${label} usage`} code={getThirdPartyUsageSnippet(skin, framework)} />
      </div>
    </div>
  );
}
