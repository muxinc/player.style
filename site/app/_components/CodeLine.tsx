import CopyButton from './CopyButton';

type CodeLineProps = {
  label: string;
  code: string;
};

/** A single line of code with a label and copy button. */
export default function CodeLine({ label, code }: CodeLineProps) {
  return (
    <div className="flex flex-col gap-0.25">
      <span className="leading-mono text-gray-dark font-mono text-xs uppercase">{label}</span>
      <div className="border-gray flex items-center gap-0.5 rounded-xs border bg-white py-0.25 pr-0.25 pl-0.5">
        <code className="min-w-0 flex-1 overflow-x-auto font-mono text-sm leading-normal whitespace-nowrap">
          {code}
        </code>
        <CopyButton text={code} label={`Copy ${label} snippet`} />
      </div>
    </div>
  );
}
