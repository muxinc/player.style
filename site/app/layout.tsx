import clsx from 'clsx';
import type { Metadata } from 'next';

import { baseOpenGraph, baseTwitter } from '@/lib/site-metadata';

import { AnalyticsProvider } from './_components/AnalyticsProvider';
import Footer from './_components/Footer';
import NavBar from './_components/NavBar';
import fontVariableClassNames from './styles/fonts';

import './styles/globals.css';

const title = 'player.style – Skins for Video.js';
const description =
  'A gallery of first- and third-party skins for Video.js 10. Preview every skin, set your accent color, and install it in React, HTML, Vue, Svelte, or from the CDN.';

export const metadata: Metadata = {
  metadataBase: new URL('https://player.style'),
  title: {
    default: title,
    template: '%s – player.style',
  },
  description,
  openGraph: { ...baseOpenGraph, title, description, url: '/' },
  twitter: { ...baseTwitter, title, description },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={clsx(fontVariableClassNames)}>
      <body className="flex min-h-screen flex-col">
        <AnalyticsProvider>
          <NavBar />
          <main className="flex flex-1 flex-col">{children}</main>
          <Footer />
        </AnalyticsProvider>
      </body>
    </html>
  );
}
