import clsx from 'clsx';
import NextLink from 'next/link';
import { ComponentPropsWithoutRef } from 'react';

export default function Link({ className, ...rest }: ComponentPropsWithoutRef<typeof NextLink>) {
  return (
    <NextLink
      className={clsx(
        'decoration-link underline underline-offset-normal hover:no-underline focus-visible:no-underline',
        className
      )}
      {...rest}
    />
  );
}
