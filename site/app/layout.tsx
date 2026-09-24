import type { Metadata } from 'next';

import { baseOpenGraph, baseTwitter } from '@/lib/site-metadata';

import { AnalyticsProvider } from './_components/AnalyticsProvider';
import Footer from './_components/Footer';
import NavBar from './_components/NavBar';
import { THEME_COLORS } from './_components/theme';
import ThemeInit from './_components/ThemeInit';
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

const DISPLAY_FONT_PRELOADS = [
  'https://static.mux.com/fonts/EurostileLTProExtended2/font.woff2',
  'https://static.mux.com/fonts/EurostileLTProBoldExtended2/font.woff2',
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // The theme script toggles `.dark` on <html> before hydration, so React must not reconcile that class.
    <html lang="en" className={fontVariableClassNames} suppressHydrationWarning>
      <head>
        {/* One tag, not one per scheme: the theme script rewrites it to follow the stored preference. */}
        <meta name="theme-color" content={THEME_COLORS.light} />
        {DISPLAY_FONT_PRELOADS.map((href) => (
          <link key={href} rel="preload" href={href} as="font" type="font/woff2" crossOrigin="anonymous" />
        ))}
        <ThemeInit />
      </head>
      <body className="bg-manila-light text-p2 text-faded-black selection:bg-gold selection:text-faded-black dark:bg-faded-black dark:text-manila-light flex min-h-screen min-w-80 flex-col font-sans text-pretty">
        <a
          href="#main-content"
          className="bg-manila-light font-display text-h3 text-faded-black dark:bg-faded-black dark:text-manila-light sr-only uppercase focus:not-sr-only focus:fixed focus:top-0 focus:left-0 focus:z-50 focus:px-4 focus:py-2"
        >
          Skip to content
        </a>
        <AnalyticsProvider>
          <NavBar />
          <main id="main-content" className="flex flex-1 flex-col">
            {children}
          </main>
          <Footer />
        </AnalyticsProvider>
      </body>
    </html>
  );
}
