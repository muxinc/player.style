'use client';

import type { OpenEditionFile } from '@/lib/open-editions';
import { getOpenInstall } from '@/lib/open-install';
import type { Renderer } from '@/lib/presets';
import type { ThirdPartySkin, UseCase } from '@/lib/skins';
import {
  getThirdPartyInstallCommand,
  getThirdPartySnippets,
  type Framework,
  type InstallKind,
} from '@/lib/third-party-usage';

import CodeLine from './CodeLine';
import CodeTabs from './CodeTabs';
import OpenEditionInstall from './OpenEditionInstall';
import { useAccent } from './useAccent';

type ThirdPartySnippetsProps = {
  skin: ThirdPartySkin;
  /** The use case the page's picker holds, which picks the package the snippets install. */
  useCase: UseCase;
  framework: Framework;
  renderer: Renderer;
  install: InstallKind;
  /** The open edition's files, when the visitor chose Open; read on the server at build time. */
  openFiles?: OpenEditionFile[];
};

/**
 * The install line and pasteable code for the pickers' selection; an open install adds the shadcn commands and the
 * files between them. The accent comes from the live `?accent=`, so the snippets follow the picker as it drags; the
 * other choices are server-rendered from the URL.
 */
export default function ThirdPartySnippets({
  skin,
  useCase,
  framework,
  renderer,
  install,
  openFiles,
}: ThirdPartySnippetsProps) {
  const accent = useAccent();
  const selection = { framework, renderer, install, accent };
  const blocks = getThirdPartySnippets(skin, useCase, selection);

  return (
    <>
      <CodeLine label="Install" code={getThirdPartyInstallCommand(skin, useCase, selection)} />
      {install === 'open' && openFiles && (
        <OpenEditionInstall install={getOpenInstall(skin, useCase, framework)} files={openFiles} />
      )}
      {blocks.map((block) => (
        <div key={block.label} className="flex flex-col gap-2">
          {block.files.length > 1 && <p className="text-p3 font-semibold">{block.label}</p>}
          <CodeTabs label={block.label} files={block.files} />
        </div>
      ))}
    </>
  );
}
