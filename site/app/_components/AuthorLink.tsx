import clsx from 'clsx';
import React from 'react';

interface AuthorImageProps {
  handle: string;
  className?: string;
}

const AuthorImage: React.FC<AuthorImageProps> = ({ handle, className }) => {
  const username = handle.replace('@', '');
  const githubUrl = `https://github.com/${username}`;

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`${githubUrl}.png?size=100`} alt={`Avatar for ${handle}`} className={className} />;
};

interface AuthorLinkProps {
  handle: string;
  className?: string;
}

const AuthorLink: React.FC<AuthorLinkProps> = ({ handle, className }) => {
  const username = handle.replace('@', '');
  const githubUrl = `https://github.com/${username}`;

  return (
    <a
      href={githubUrl}
      className={clsx('inline-flex gap-0.5 flex-row items-center mb-1 group', className)}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="rounded-1 overflow-clip">
        <AuthorImage handle={handle} className="w-2 h-2" />
      </span>
      <span className="font-mono leading-mono font-normal">
        By{' '}
        <span className="underline-offset-mono decoration-link group-hover:underline group-focus-visible:underline">
          {handle}
        </span>
      </span>
    </a>
  );
};

export default AuthorLink;
