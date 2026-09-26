'use client';

import { useState } from 'react';

import type { HighlightedCode } from '@/lib/code-snippet';
import type { ShadcnRunner } from '@/lib/registry';

import CodeBlock from './CodeBlock';
import CodeLine from './CodeLine';
import CodeTabs from './CodeTabs';
import ChevronRightIcon from './icons/ChevronRightIcon';
import InlineCode from './InlineCode';
import { touchTarget } from './ui';

/** One package manager's commands, highlighted on the server. */
export interface ShadcnRunnerCode {
  name: ShadcnRunner;
  namespaced: HighlightedCode;
  url: HighlightedCode;
  /** Reviewing the item before adding it, and updating it later. */
  maintain: HighlightedCode;
}

type ShadcnInstallProps = {
  /** The registry item, `<name>` or `<name>-live`. */
  item: string;
  /** The catalog's label, `HTML` or `React`. */
  catalog: string;
  /** The pinned Video.js package the item installs. */
  dependency: string;
  runners: readonly ShadcnRunnerCode[];
  componentsJson: HighlightedCode;
  tsconfigPaths: HighlightedCode;
  /** SvelteKit generates its own path aliases, which the CLI cannot read; the disclosure says what to do instead. */
  svelte: boolean;
};

const DEFAULT_RUNNER: ShadcnRunner = 'npm';

/**
 * The shadcn install: the `components.json` a project without shadcn needs behind a disclosure, the registry commands
 * (one package manager picked for every command), and how to review and update the installed source.
 */
export default function ShadcnInstall({
  item,
  catalog,
  dependency,
  runners,
  componentsJson,
  tsconfigPaths,
  svelte,
}: ShadcnInstallProps) {
  const [runnerName, setRunnerName] = useState<string>(DEFAULT_RUNNER);
  const runner = runners.find((entry) => entry.name === runnerName) ?? runners[0]!;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-p2 text-pretty">
        Add the skin&rsquo;s source to your project the same way Video.js installs its own skins: point the{' '}
        <InlineCode>@player-style</InlineCode> namespace at the {catalog} catalog, then add{' '}
        <InlineCode>{item}</InlineCode>. The item also installs <InlineCode>{dependency}</InlineCode>.
      </p>
      <details className="group border-line corner-squircle rounded-lg border">
        <summary
          className={`text-p2 flex cursor-pointer list-none items-center gap-2 px-3 py-2 font-semibold select-none [&::-webkit-details-marker]:hidden ${touchTarget}`}
        >
          <ChevronRightIcon className="text-muted size-4 shrink-0 transition group-open:rotate-90" />
          No <InlineCode>components.json</InlineCode> yet?
        </summary>
        <div className="border-line flex flex-col gap-3 border-t p-3">
          <p className="text-p2 text-pretty">
            <InlineCode>shadcn init</InlineCode> only sets up React projects that use Tailwind CSS. Any other project,
            Vue and Svelte included, needs just this file for the CLI to place the skin. Keep{' '}
            <InlineCode>cssVariables</InlineCode> on: off, the CLI rewrites the skin&rsquo;s inline SVGs.
          </p>
          <CodeBlock label="components.json" {...componentsJson} />
          <p className="text-p2 text-pretty">
            The CLI finds the <InlineCode>@/components</InlineCode> alias through <InlineCode>paths</InlineCode> in{' '}
            <InlineCode>tsconfig.json</InlineCode> (and <InlineCode>tsconfig.app.json</InlineCode> in a Vite React
            project). Leave out <InlineCode>baseUrl</InlineCode>, which TypeScript 6 rejects.
            {svelte && (
              <>
                {' '}
                SvelteKit generates its own aliases, which the CLI misreads, so there add this only while the CLI runs.
              </>
            )}
          </p>
          <CodeBlock label="tsconfig.json" {...tsconfigPaths} />
        </div>
      </details>
      <CodeTabs
        label="Add with shadcn"
        files={runners.map((entry) => ({ name: entry.name, ...entry.namespaced }))}
        value={runner.name}
        onValueChange={setRunnerName}
      />
      <CodeLine label="Or without a namespace" {...runner.url} />
      <p className="text-p2 text-pretty">
        The files are yours to edit. <InlineCode>view</InlineCode> prints the item before you add it; adding it again
        with <InlineCode>--overwrite</InlineCode> replaces your copy with the current source.
      </p>
      <CodeBlock label="Review and update" {...runner.maintain} />
    </div>
  );
}
