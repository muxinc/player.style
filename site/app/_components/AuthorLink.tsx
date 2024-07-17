import React from 'react';

interface AuthorLinkProps {
  handle: string;
  className?: string;
  children?: React.ReactNode;
}

const AuthorLink: React.FC<AuthorLinkProps> = ({ handle, className, children }) => {
  const username = handle.replace('@', '');
  const githubUrl = `https://github.com/${username}`;

  return (
    <a href={githubUrl} className={className} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
};

export default AuthorLink;
