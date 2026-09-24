import clsx from 'clsx';

import type { Skin } from '@/lib/skins';

import VideojsMark from './logos/VideojsMark';

type AuthorLinkProps = {
  author: Skin['author'];
  size?: 'sm' | 'md';
  className?: string;
};

/**
 * Authors whose GitHub avatar is not their current mark. The `videojs` organisation still shows the pre-10 logo, and
 * Video.js 10 has no new logo yet, so its skins carry the favicon mark instead.
 */
const LOCAL_MARKS: Record<string, typeof VideojsMark> = { videojs: VideojsMark };

/** The skin author with their mark or GitHub avatar, linking to their site when there is one. */
export default function AuthorLink({ author, size = 'sm', className }: AuthorLinkProps) {
  const href = author.url ?? (author.github ? `https://github.com/${author.github}` : undefined);
  const Mark = author.github ? LOCAL_MARKS[author.github] : undefined;
  const avatar = author.github && !Mark ? `https://github.com/${author.github}.png?size=100` : undefined;
  const Tag = href ? 'a' : 'span';
  const markSize = size === 'md' ? 'size-8' : 'size-6';

  return (
    <Tag
      href={href}
      target={href ? '_blank' : undefined}
      rel={href ? 'noreferrer' : undefined}
      className={clsx('group inline-flex items-center gap-2 text-p3', className)}
    >
      {Mark && <Mark className={clsx('shrink-0 rounded-md corner-squircle', markSize)} />}
      {avatar && (
        <img
          src={avatar}
          alt=""
          width={size === 'md' ? 56 : 28}
          height={size === 'md' ? 56 : 28}
          loading="lazy"
          className={clsx('rounded-full bg-surface-raised ring-1 ring-line', markSize)}
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
