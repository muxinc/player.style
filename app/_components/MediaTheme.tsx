'use client';

import { ReactNode } from 'react';
import 'media-chrome';
import { MediaTheme } from 'media-chrome/dist/react/media-theme.js';

type MediaThemeProps = {
  name: string;
  theme: any;
  children?: ReactNode;
};

export default function MediaThemeComponent(props: MediaThemeProps) {
  const { name, theme, children } = props;

  return (
    <>
      <template
        id={`media-theme-${name}`}
        dangerouslySetInnerHTML={{ __html: `${theme.templates.html.content}` }}
      />
      <MediaTheme template={`media-theme-${name}`} {...theme.templates.html.props}>
        {children}
      </MediaTheme>
    </>
  );
}
