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
      className={clsx('group inline-flex items-center gap-2 text-p3', className)}
    >
      {avatar && (
        <img
          src={avatar}
          alt=""
          width={size === 'md' ? 56 : 28}
          height={size === 'md' ? 56 : 28}
          loading="lazy"
          className={clsx('rounded-full bg-surface-raised ring-1 ring-line', size === 'md' ? 'size-8' : 'size-6')}
        />
      )}
      <span className="text-muted">
        By{' '}
        <span
          className={clsx(
            'text-faded-black dark:text-manila-light',
            href && 'underline decoration-transparent group-hover:decoration-gold group-focus-visible:decoration-gold'
          )}
        >
          {author.name}
        </span>
      </span>
    </Tag>
  );
}
