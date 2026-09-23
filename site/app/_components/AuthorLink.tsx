import clsx from 'clsx';

import type { Skin } from '@/lib/skins';

type AuthorLinkProps = {
  author: Skin['author'];
  size?: 'sm' | 'md';
  className?: string;
};

/** The skin author with a GitHub avatar when there is a GitHub handle, linking to their site when there is one. */
export default function AuthorLink({ author, size = 'sm', className }: AuthorLinkProps) {
  const href = author.url ?? (author.github ? `https://github.com/${author.github}` : undefined);
  const avatar = author.github ? `https://github.com/${author.github}.png?size=100` : undefined;
  const Tag = href ? 'a' : 'span';

  return (
    <Tag
      href={href}
      target={href ? '_blank' : undefined}
      rel={href ? 'noreferrer' : undefined}
      className={clsx('group inline-flex items-center gap-0.5', className)}
    >
      {avatar && (
        <img
          src={avatar}
          alt=""
          width={size === 'md' ? 56 : 28}
          height={size === 'md' ? 56 : 28}
          loading="lazy"
          className={clsx('rounded-full bg-putty', size === 'md' ? 'size-2' : 'size-1')}
        />
      )}
      <span className="leading-mono font-mono text-sm">
        By{' '}
        <span
          className={clsx(href && 'underline-offset-[0.125em] group-hover:underline group-focus-visible:underline')}
        >
          {author.name}
        </span>
      </span>
    </Tag>
  );
}
