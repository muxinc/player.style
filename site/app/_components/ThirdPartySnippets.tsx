'use client';

import { resolveAccentCode, type AccentCode, type HighlightedCode } from '@/lib/code-snippet';

import CodeLine from './CodeLine';
import CodeTabs from './CodeTabs';
import { useAccent } from './useAccent';

/** A usage block with each file highlighted on the server in both accent states. */
export interface AccentSnippetBlock {
  label: string;
  files: { name: string; code: AccentCode }[];
}

type ThirdPartySnippetsProps = {
  /** The npm line and its label, when the selection installs anything from npm. */
  install?: HighlightedCode & { label: string };
  blocks: readonly AccentSnippetBlock[];
};

/**
 * The install line and pasteable code for the pickers' selection. The server renders every choice from the URL; the
 * accent comes from the live `?accent=`, so the snippets follow the picker as it drags without a round trip.
 */
export default function ThirdPartySnippets({ install, blocks }: ThirdPartySnippetsProps) {
  const accent = useAccent();

  return (
    <>
      {install && <CodeLine {...install} />}
      {blocks.map((block) => (
        <div key={block.label} className="flex flex-col gap-2">
          {block.files.length > 1 && <p className="text-p3 font-semibold">{block.label}</p>}
          <CodeTabs
            label={block.label}
            files={block.files.map((file) => ({ name: file.name, ...resolveAccentCode(file.code, accent) }))}
          />
        </div>
      ))}
    </>
  );
}
