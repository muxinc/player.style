'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';

export default function ColorPicker({ ...props }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const onChange = (color: string) => {
    color = color.replace('#', '');

    const params = new URLSearchParams(searchParams);
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

  const color = searchParams.get(props.id)?.toString();

  return (
    <input
      type="color"
      className={clsx('w-1 h-1 border-none rounded-[50%]', props.className)}
      {...props}
      defaultValue={color ? `#${color}` : props.defaultValue}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
