'use client';

import type { OpenEditionFile } from '@/lib/open-editions';
import type { Renderer } from '@/lib/presets';
import type { ThirdPartySkin } from '@/lib/skins';
import {
  getThirdPartyInstallCommand,
  getThirdPartySnippets,
  type Framework,
  type InstallKind,
} from '@/lib/third-party-usage';

import CodeLine from './CodeLine';
import CodeTabs from './CodeTabs';
import InlineCode from './InlineCode';
import { useAccent } from './useAccent';

type ThirdPartySnippetsProps = {
  skin: ThirdPartySkin;
  framework: Framework;
  renderer: Renderer;
  install: InstallKind;
  /** The open edition's files, when the visitor chose Open; read on the server at build time. */
  openFiles?: OpenEditionFile[];
};

/**
 * The install line and pasteable code for the pickers' selection. The accent comes from the live `?accent=`, so the
 * snippets follow the picker as it drags; the other choices are server-rendered from the URL.
 */
export default function ThirdPartySnippets({ skin, framework, renderer, install, openFiles }: ThirdPartySnippetsProps) {
  const accent = useAccent();
  const selection = { framework, renderer, install, accent };
  const blocks = getThirdPartySnippets(skin, selection);

  return (
    <>
      <CodeLine label="Install" code={getThirdPartyInstallCommand(skin, selection)} />
      {install === 'open' && openFiles && (
        <div className="flex flex-col gap-3">
          <p className="text-p3 text-pretty">
            Copy these files into your project; they are the skin as source you own, not a registry. Both editions share{' '}
            <InlineCode>skin.css</InlineCode>; <InlineCode>register.ts</InlineCode> loads the Video.js elements{' '}
            <InlineCode>skin.html</InlineCode> uses, and <InlineCode>Skin.tsx</InlineCode> is the React component.
          </p>
          <CodeTabs label="Open edition files" files={openFiles} maxHeight="32rem" />
        </div>
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
