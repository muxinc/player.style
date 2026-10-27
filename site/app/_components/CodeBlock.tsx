import type { HighlightedCode } from '@/lib/code-snippet';

import CodeFrame, { CodeContent } from './CodeFrame';

type CodeBlockProps = HighlightedCode & {
  label: string;
};

/** A multi-line snippet with a label and copy button; the single-line sibling is `CodeLine`. */
export default function CodeBlock({ label, code, html }: CodeBlockProps) {
  return (
    <CodeFrame label={label} code={code}>
      <pre className="text-code overflow-x-auto px-4 py-4 font-mono leading-relaxed md:px-5">
        <CodeContent code={code} html={html} />
      </pre>
    </CodeFrame>
  );
}
