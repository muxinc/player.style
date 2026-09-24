import CodeFrame from './CodeFrame';

type CodeBlockProps = {
  label: string;
  code: string;
};

/** A multi-line snippet with a label and copy button; the single-line sibling is `CodeLine`. */
export default function CodeBlock({ label, code }: CodeBlockProps) {
  return (
    <CodeFrame label={label} code={code}>
      <pre className="text-code overflow-x-auto px-4 py-4 font-mono leading-relaxed md:px-5">
        <code>{code}</code>
      </pre>
    </CodeFrame>
  );
}
