import React from 'react';

interface AuthorLinkProps {
  handle: string;
}

const AuthorLink: React.FC<AuthorLinkProps> = ({ handle }) => {
  const username = handle.replace('@', '');
  const githubUrl = `https://github.com/${username}`;

  return (
    <a href={githubUrl} target="_blank" rel="noopener noreferrer">
      {handle}
    </a>
  );
};

export default AuthorLink;