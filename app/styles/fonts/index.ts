import localFont from 'next/font/local';

const Aeonik = localFont({
  variable: '--body',
  src: [
    { path: './Aeonik/Aeonik-Bold.woff2', weight: '700', style: 'normal' },
    { path: './Aeonik/Aeonik-BoldItalic.woff2', weight: '700', style: 'italic' },
    { path: './Aeonik/Aeonik-RegularItalic.woff2', weight: '400', style: 'italic' },
    { path: './Aeonik/Aeonik-Regular.woff2', weight: '400', style: 'normal' },
  ],
  display: 'swap',
  fallback: ['"Helvetica Neue"', 'Helvetica', 'sans-serif'],
});

const Rotonto = localFont({
  variable: '--display',
  src: './Rotonto/Rotonto-Regular.woff2',
  display: 'auto',
  fallback: ['"Helvetica Neue"', 'Helvetica', 'sans-serif'],
});

const JetBrainsMono = localFont({
  variable: '--mono',
  src: './JetBrains/JetBrainsMono-Regular.woff2',
  display: 'swap',
  fallback: ['monaco', 'monospace'],
});

const Knewave = localFont({
  variable: '--font-knewave',
  src: './Knewave/Knewave-Regular.woff2',
  display: 'auto',
  fallback: ['"Helvetica Neue"', 'Helvetica', 'sans-serif'],
});

const fontVariableClassNames = [
  Aeonik.variable,
  Rotonto.variable,
  JetBrainsMono.variable,
  Knewave.variable,
].join(' ');

export default fontVariableClassNames;
