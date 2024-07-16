import React from 'react';

interface AuthorLinkProps {
  handle: string;
  className?: string;
}

const AuthorLink: React.FC<AuthorLinkProps> = ({ handle, className }) => {
  const username = handle.replace('@', '');
  const githubUrl = `https://github.com/${username}`;

  return (
    <a href={githubUrl} className={className} target="_blank" rel="noopener noreferrer">
      {handle}
    </a>
  );
};

export default AuthorLink;
