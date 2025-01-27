'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';

export default function ColorPicker({ ...props }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const params = new URLSearchParams(searchParams);
  let color = searchParams.get(props.id)?.toString();

  const onChange = (color: string) => {
    color = color.replace('#', '');
    if (color) {
      params.set(props.id, color);
    } else {
      // This is a workaround for a bug where the page without a search query
      // would not trigger a RSC update.
      // params.delete(props.id);
      params.set(props.id, color);
    }
    replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const resetPicker = () => {
    params.delete(props.id);
    replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="relative w-auto h-auto bg-transparent">
      <input
        type="color"
        className={clsx('w-1.5 h-1.5 border border-gray rounded-[50%]', props.className)}
        {...props}
        value={color ? `#${color}` : props.defaultValue}
        defaultValue={color}
        onChange={(e) => onChange(e.target.value)}
      />
      {color && (
        <button
          aria-label="Clear"
          className={
            'w-0.75 h-0.75 text-[0.75rem] font-bold bg-white border border-gray rounded-[50%] absolute top-0 right-0 text-gray-500 hover:text-gray-800 focus:outline-none'
          }
          onClick={resetPicker}
        >
          <svg className={'w-0.5 h-0.5 scale-50 m-auto'} viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M4.9999 6.40005L2.0829 9.32505C1.89824 9.50838 1.66357 9.60005 1.3789 9.60005C1.09424 9.60005 0.859569 9.50838 0.674902 9.32505C0.491569 9.14172 0.399902 8.90838 0.399902 8.62505C0.399902 8.34172 0.491569 8.10838 0.674902 7.92505L3.5999 5.00005L0.674902 2.10805C0.491569 1.92338 0.399902 1.68872 0.399902 1.40405C0.399902 1.11938 0.491569 0.884715 0.674902 0.700048C0.858236 0.516715 1.09157 0.425049 1.3749 0.425049C1.65824 0.425049 1.89157 0.516715 2.0749 0.700048L4.9999 3.62505L7.8919 0.700048C8.07657 0.516715 8.31123 0.425049 8.5959 0.425049C8.88057 0.425049 9.11524 0.516715 9.2999 0.700048C9.4999 0.900048 9.5999 1.13772 9.5999 1.41305C9.5999 1.68838 9.4999 1.91738 9.2999 2.10005L6.3749 5.00005L9.2999 7.91705C9.48324 8.10172 9.5749 8.33638 9.5749 8.62105C9.5749 8.90572 9.48324 9.14038 9.2999 9.32505C9.0999 9.52505 8.86257 9.62505 8.5879 9.62505C8.31324 9.62505 8.0839 9.52505 7.8999 9.32505L4.9999 6.40005Z"
              fill="black"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
