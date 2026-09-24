import clsx from 'clsx';
import type { ReactNode } from 'react';

import { inlineCode } from './ui';

export default function InlineCode({ className, children }: { className?: string; children: ReactNode }) {
  return <code className={clsx(inlineCode, className)}>{children}</code>;
}
