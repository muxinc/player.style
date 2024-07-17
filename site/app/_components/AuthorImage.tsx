import React from 'react';

interface AuthorImageProps {
  handle: string;
  className?: string;
}

const AuthorImage: React.FC<AuthorImageProps> = ({ handle, className }) => {
  const username = handle.replace('@', '');
  const githubUrl = `https://github.com/${username}`;

  return (
    <img src={`${githubUrl}.png?size=100`} alt={`Avatar for ${handle}`} className={className} />
  );
};

export default AuthorImage;
