import { ComponentPropsWithoutRef } from 'react';
import Link from './Link';
import clsx from 'clsx';

export default function LinkWithUnderline({ className, ...rest }: ComponentPropsWithoutRef<typeof Link>) {
  return (
    <Link
      className={clsx(
        'decoration-link underline underline-offset-normal hover:no-underline focus-visible:no-underline',
        className
      )}
      {...rest}
    />
  );
}
