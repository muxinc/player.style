import { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import type { Theme } from '../_types/theme';

type ThemePreviewProps = Theme & {
  key: string;
  children?: ReactNode;
  priority: boolean;
};

export default function ThemePreview(props: ThemePreviewProps) {
  return (
    <>
      <Link
        className="border-ctx border -m-0.5px relative grid gap-x-2 gap-y-1 p-1 pb-2 md:px-2 md:py-1.5 group hover:bg-white focus-visible:bg-white"
        href={`/themes/${props.slug}`}
      >
        <div className="relative bg-white border border-putty">
          <Image
            priority={props.priority}
            src={`https://picsum.photos/1440/720/?random=${props.slug}`}
            width={1440}
            height={720}
            alt={props.title}
          />
        </div>
        <div className="pr-1">
          <h2 className="font-body text-xl md:text-3xl leading-heading last:mb-0 mb-0.5 font-bold normal-case decoration-link underline-offset-heading cursor-pointer hover:underline focus-visible:underline group-hover:underline group-focus-visible:underline max-w-26 [text-wrap:pretty]">
            {props.title}
          </h2>
          <p className="mb-0.5 font-body text-base tracking-wide leading-normal font-normal normal-case max-w-26">
            {props.description}
          </p>
          <div className="flex gap-0.5 flex-row items-center">
            <div className="font-mono text-sm leading-mono font-normal uppercase text-gray-dark">
              By {props.author.name}
            </div>
          </div>
        </div>
      </Link>
    </>
  );
}
