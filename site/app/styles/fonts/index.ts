import localFont from 'next/font/local';

const Aeonik = localFont({
  variable: '--font-aeonik',
  src: [
    { path: './Aeonik/Aeonik-Regular.woff2', weight: '400', style: 'normal' },
    { path: './Aeonik/Aeonik-RegularItalic.woff2', weight: '400', style: 'italic' },
    { path: './Aeonik/Aeonik-Medium.woff2', weight: '500', style: 'normal' },
    { path: './Aeonik/Aeonik-Bold.woff2', weight: '700', style: 'normal' },
    { path: './Aeonik/Aeonik-BoldItalic.woff2', weight: '700', style: 'italic' },
  ],
  display: 'swap',
  fallback: ['Helvetica Neue', 'Helvetica', 'sans-serif'],
});

const Rotonto = localFont({
  variable: '--font-rotonto',
  src: './Rotonto/Rotonto-Regular.woff2',
  display: 'auto',
  fallback: ['Helvetica Neue', 'Helvetica', 'sans-serif'],
});

const JetBrainsMono = localFont({
  variable: '--font-jetbrains-mono',
  src: './JetBrains/JetBrainsMono-Regular.woff2',
  display: 'swap',
  fallback: ['monaco', 'monospace'],
});

const fontVariableClassNames = [Aeonik.variable, Rotonto.variable, JetBrainsMono.variable].join(' ');

export default fontVariableClassNames;
