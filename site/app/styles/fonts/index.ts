import { IBM_Plex_Mono, Instrument_Sans } from 'next/font/google';

/** Body and mono faces from Google Fonts (both OFL), exposed as the variables `globals.css` maps to `--font-sans` and `--font-mono`. */
const instrumentSans = Instrument_Sans({
  variable: '--font-instrument-sans',
  subsets: ['latin'],
  weight: 'variable',
  style: ['normal', 'italic'],
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: '--font-ibm-plex-mono',
  subsets: ['latin'],
  weight: ['400', '600'],
  display: 'swap',
});

const fontVariableClassNames = [instrumentSans.variable, ibmPlexMono.variable].join(' ');

export default fontVariableClassNames;
