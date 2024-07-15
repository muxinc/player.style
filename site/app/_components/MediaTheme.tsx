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
  defaultDuration?: number;
};

export default function MediaThemeComponent(props: MediaThemeProps) {
  const { name, theme, children, className, defaultDuration } = props;

  return (
    <>
      <template
        id={`media-theme-${name}`}
        dangerouslySetInnerHTML={{ __html: `${theme.templates.html.content}` }}
      />
      <MediaTheme
        className={clsx('block w-full', className)}
        key={theme.templates.html.content}
        template={`media-theme-${name}`}
        defaultDuration={defaultDuration}
        {...theme.templates.html.props}
      >
        {children}
      </MediaTheme>
    </>
  );
}
