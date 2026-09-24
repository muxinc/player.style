import CopyButton from './CopyButton';

type CodeBlockProps = {
  label: string;
  code: string;
};

/** A multi-line snippet with a label and copy button; the single-line sibling is `CodeLine`. */
export default function CodeBlock({ label, code }: CodeBlockProps) {
  return (
    <div className="flex flex-col gap-0.25">
      <span className="leading-mono text-gray-dark font-mono text-xs uppercase">{label}</span>
      <div className="border-gray relative rounded-xs border bg-white">
        <pre className="overflow-x-auto py-0.5 pr-2 pl-0.5 font-mono text-sm leading-normal">
          <code>{code}</code>
        </pre>
        <CopyButton text={code} label={`Copy ${label} snippet`} className="absolute top-0.25 right-0.25" />
      </div>
    </div>
  );
}
