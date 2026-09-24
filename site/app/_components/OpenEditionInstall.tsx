'use client';

import { useState } from 'react';

import type { OpenEditionFile } from '@/lib/open-editions';
import type { OpenInstall } from '@/lib/open-install';
import { REGISTRY_FRAMEWORK_LABELS, REGISTRY_PACKAGES, type ShadcnRunner } from '@/lib/registry';

import CodeBlock from './CodeBlock';
import CodeLine from './CodeLine';
import CodeTabs from './CodeTabs';
import ChevronRightIcon from './icons/ChevronRightIcon';
import InlineCode from './InlineCode';

type OpenEditionInstallProps = {
  install: OpenInstall;
  /** The open edition's files, for the visitor who copies them by hand. */
  files: OpenEditionFile[];
};

const DEFAULT_RUNNER: ShadcnRunner = 'npm';

/**
 * The Open install: the skin's source through the shadcn CLI first (one runner picked for both command blocks), the
 * `components.json` a project without shadcn needs behind a disclosure, then the same files to copy by hand, with the
 * directory the CLI would have used so both routes end in the same imports.
 */
export default function OpenEditionInstall({ install, files }: OpenEditionInstallProps) {
  const [runner, setRunner] = useState<string>(DEFAULT_RUNNER);
  const command = install.commands.find((entry) => entry.name === runner) ?? install.commands[0]!;
  const catalog = REGISTRY_FRAMEWORK_LABELS[install.registryFramework];
  const dependency = REGISTRY_PACKAGES[install.registryFramework];

  return (
    <>
      <div className="flex flex-col gap-3">
        <p className="text-p3 text-pretty">
          Add the skin&rsquo;s source to your project with the shadcn CLI, or copy the files below. The{' '}
          <InlineCode>{install.item}</InlineCode> item in the {catalog} catalog also installs{' '}
          <InlineCode>{dependency}</InlineCode>.
        </p>
        <CodeTabs
          label="Add with shadcn"
          files={install.commands.map((entry) => ({ name: entry.name, code: entry.namespaced }))}
          value={runner}
          onValueChange={setRunner}
        />
        <CodeLine label="Or without a namespace" code={command.url} />
        <details className="group border-line corner-squircle rounded-lg border">
          <summary className="text-p3 flex cursor-pointer list-none items-center gap-2 px-3 py-2 font-semibold select-none [&::-webkit-details-marker]:hidden">
            <ChevronRightIcon className="text-muted size-4 shrink-0 transition group-open:rotate-90" />
            No <InlineCode>components.json</InlineCode> yet?
          </summary>
          <div className="border-line flex flex-col gap-3 border-t px-3 pt-3 pb-3">
            <p className="text-p3 text-pretty">
              A project that never ran <InlineCode>shadcn init</InlineCode>, such as one without Tailwind, needs only
              this file for the CLI to place the skin; keep <InlineCode>cssVariables</InlineCode> on, since off it
              rewrites the skin&rsquo;s inline SVGs.
            </p>
            <CodeBlock label="components.json" code={install.componentsJson} />
          </div>
        </details>
      </div>
      <div className="flex flex-col gap-3">
        <p className="text-p3 font-semibold">Or copy the files</p>
        <p className="text-p3 text-pretty">
          The same source, to copy by hand. Both editions share <InlineCode>skin.css</InlineCode>;{' '}
          <InlineCode>register.ts</InlineCode> loads the Video.js elements <InlineCode>skin.html</InlineCode> uses, and{' '}
          <InlineCode>Skin.tsx</InlineCode> is the React component.
        </p>
        <CodeTabs label="Open edition files" files={files} maxHeight="32rem" />
        <p className="text-p4 text-muted text-pretty">
          The CLI writes{' '}
          {install.targetPaths.map((path, index) => (
            <span key={path}>
              {index > 0 && ', '}
              <InlineCode>{path}</InlineCode>
            </span>
          ))}{' '}
          under your components alias; put copied files in the same place, since the usage below imports from{' '}
          <InlineCode>{install.directory}/</InlineCode>.
        </p>
      </div>
    </>
  );
}
