'use client';

import { ReactNode } from 'react';
import clsx from 'clsx';
import 'media-chrome';
import { useSearchParams } from 'next/navigation';
import { MediaTheme } from 'media-chrome/dist/react/media-theme.js';
import 'media-chrome/dist/menu/index.js';

type MediaThemeProps = {
  name: string;
  theme: any;
  children?: ReactNode;
  className?: string;
  defaultDuration?: number;
  mediaTitle?: string;
  mediaByline?: string;
};

export default function MediaThemeComponent(props: MediaThemeProps) {
  const { name, theme, children, className, defaultDuration, ...rest } = props;
  const searchParams = useSearchParams();

  const accentColor = searchParams.get('accent-color')
    ? `#${searchParams.get('accent-color')}`
    : theme.accentColor;

  const primaryColor = searchParams.get('primary-color')
    ? `#${searchParams.get('primary-color')}`
    : theme.primaryColor;

  const secondaryColor = searchParams.get('secondary-color')
    ? `#${searchParams.get('secondary-color')}`
    : theme.secondaryColor;

  return (
    <>
      <template
        id={`media-theme-${name}`}
        dangerouslySetInnerHTML={{ __html: `${theme.templates.html.content}` }}
      />
      <MediaTheme
        className={clsx('block w-full h-full', className, theme.themeProps?.className)}
        key={theme.templates.html.content}
        template={`media-theme-${name}`}
        defaultDuration={defaultDuration}
        style={{
          '--media-accent-color': accentColor,
          '--media-primary-color': primaryColor,
          '--media-secondary-color': secondaryColor,
        }}
        {...theme.templates.html.props}
        {...rest}
      >
        {children}
      </MediaTheme>
    </>
  );
}
