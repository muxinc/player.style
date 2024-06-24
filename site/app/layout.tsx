import type { Metadata } from 'next';
import clsx from 'clsx';
import fontVariableClassNames from './styles/fonts';
import './styles/globals.css';

import { AnalyticsProvider } from './_components/AnalyticsProvider';
import NavBar from './_components/NavBar';
import Footer from './_components/Footer';

export const metadata: Metadata = {
  title: 'player.style',
  description: 'A fresh collection of media player themes for every use case!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={clsx(fontVariableClassNames, 'min-w-[20rem]')}>
      <AnalyticsProvider>
        <head>
          <link rel="icon" href="/favicon.ico" sizes="any" />
          <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        </head>
        <body className="flex flex-col min-h-screen font-body antialiased bg-putty selection:bg-pink-neon/60">
          <NavBar />
          {children}
          <Footer />
        </body>
      </AnalyticsProvider>
    </html>
  );
}
