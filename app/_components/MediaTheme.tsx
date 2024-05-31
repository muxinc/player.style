'use client';

import { ReactNode } from 'react';
import clsx from 'clsx';
import 'media-chrome';
import { MediaTheme } from 'media-chrome/dist/react/media-theme.js';

type MediaThemeProps = {
  name: string;
  theme: any;
  children?: ReactNode;
  className?: string;
};

export default function MediaThemeComponent(props: MediaThemeProps) {
  const { name, theme, children, className } = props;

  return (
    <>
      <template
        id={`media-theme-${name}`}
        dangerouslySetInnerHTML={{ __html: `${theme.templates.html.content}` }}
      />
      <MediaTheme
        className={clsx('aspect-video block w-full', className)}
        key={`media-theme-${name}`}
        template={`media-theme-${name}`}
        {...theme.templates.html.props}
      >
        {children}
      </MediaTheme>
    </>
  );
}
