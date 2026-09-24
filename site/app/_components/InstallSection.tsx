import { buildInstallationUrl, getUsageSnippets } from '@/lib/installation-url';
import type { FirstPartySkin } from '@/lib/skins';

import CodeLine from './CodeLine';
import ArrowUpRightIcon from './icons/ArrowUpRightIcon';
import { buttonPrimary } from './ui';

type InstallSectionProps = {
  skin: FirstPartySkin;
};

/**
 * First-party skins install from the Video.js docs: one link to the framework-agnostic installation guide, carrying
 * the skin's preset and tier so the guide opens on this skin and lets the visitor pick framework, media, and package
 * manager there.
 */
export default function InstallSection({ skin }: InstallSectionProps) {
  const href = buildInstallationUrl(skin);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-12">
      <div className="flex min-w-0 flex-col items-start gap-4">
        <p className="text-p2 text-pretty">
          This skin ships inside Video.js. The installation guide on videojs.org opens on it and walks through your
          framework, media source, and package manager.
        </p>
        <a href={href} target="_blank" rel="noreferrer" className={buttonPrimary}>
          Install with Video.js
          <ArrowUpRightIcon className="size-4" />
        </a>
      </div>
      <div className="flex min-w-0 flex-col gap-6">
        {getUsageSnippets(skin).map((usage) => (
          <CodeLine key={usage.label} label={`${usage.label} usage`} code={usage.code} />
        ))}
      </div>
    </div>
  );
}
