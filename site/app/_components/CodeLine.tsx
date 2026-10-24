import type { HighlightedCode } from '@/lib/code-snippet';

import CodeFrame, { CodeContent } from './CodeFrame';

type CodeLineProps = HighlightedCode & {
  label: string;
};

/** A single line of code with a label and copy button. */
export default function CodeLine({ label, code, html }: CodeLineProps) {
  return (
    <CodeFrame label={label} code={code}>
      <pre className="text-code overflow-x-auto px-4 py-3 font-mono leading-relaxed whitespace-pre md:px-5">
        <CodeContent code={code} html={html} />
      </pre>
    </CodeFrame>
  );
}
