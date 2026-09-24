import CodeFrame from './CodeFrame';

type CodeLineProps = {
  label: string;
  code: string;
};

/** A single line of code with a label and copy button. */
export default function CodeLine({ label, code }: CodeLineProps) {
  return (
    <CodeFrame label={label} code={code}>
      <pre className="text-code overflow-x-auto px-4 py-3 font-mono leading-relaxed whitespace-pre md:px-5">
        <code>{code}</code>
      </pre>
    </CodeFrame>
  );
}
