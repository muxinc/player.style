/**
 * in this design system, the border of an element
 * should correspond to the background-color of its parent.
 * For example, if we have a orange-colored grid area containing blue cards,
 * the border of the cards will be orange, not blue.
 * And if we have a green-colored card containing pink buttons (ew),
 * the border of the buttons will be green, not pink.
 *
 * As long as we're at it, we add some utilities that allow us to set the background color of elements
 * to the background color of their parenting grid/card using the same system
 */
import flattenColorPalette from 'tailwindcss/lib/util/flattenColorPalette';
import plugin from 'tailwindcss/plugin';

const context = plugin(({ matchUtilities, addUtilities, theme }) => {
  matchUtilities(
    {
      'set-border-ctx': (value) => ({ '--mux-border-ctx': value }),
      'set-bg-ctx': (value) => ({ '--mux-bg-ctx': value }),
      /* elements using this class will inherit border color from the nearest card or grid as fallback */
      'border-ctx': (value) => ({
        'border-color': `var(--mux-border-ctx, ${value})`,
      }),
      /* similarly for backgrounds... */
      'bg-ctx': (value) => ({
        'background-color': `var(--mux-bg-ctx, ${value})`,
      }),
      /* and for and stroke fill (which uses the background context) */
      'fill-ctx': (value) => ({
        fill: `var(--mux-bg-ctx, ${value})`,
      }),
      'stroke-ctx': (value) => ({
        stroke: `var(--mux-bg-ctx, ${value})`,
      }),
    },
    {
      values: flattenColorPalette(theme('colors')),
      type: ['color', 'any'],
    }
  );
  addUtilities({
    /* for cases where you want to inherit colors without providing a fallback value... */
    '.border-ctx': { 'border-color': `var(--mux-border-ctx)` },
    '.bg-ctx': { 'background-color': `var(--mux-bg-ctx)` },
    '.fill-ctx': { fill: `var(--mux-bg-ctx)` },
    '.stroke-ctx': { stroke: `var(--mux-bg-ctx)` },
    /* and for the odd case where you want the text color to match the border ctx */
    '.text-border-ctx': { color: `var(--mux-border-ctx)` },
  });
});

/**
 * And now for a simple one. Kerning/Ligature fix.
 * By default, browsers disable kerning and ligatures on spaced out fonts.
 * Usually, this is a good thing. Imagine a ligature that joined ff together.
 * What would happen if the word "taffy" was spaced out?  t  a   ff   y. That's bad.
 * But in our case, .tracking-wide is mild,
 * and in our body font, our kerning and ligs still look good. Therefore...
 */
const ligatures = plugin(({ addBase }) => {
  addBase({
    '.font-body.tracking-wide': {
      'font-feature-settings': "'kern', 'dlig'",
    },
  });
});

/** One more simple one. I want scroll bars to be dark in dark mode */
const darkColorScheme = plugin(({ addBase }) => {
  addBase({
    '.dark': {
      'color-scheme': 'dark',
    },
  });
});

/** And another one. I want nested numbered lists to be alphabetic */
const nestedDecimalLists = plugin(({ addBase }) => {
  addBase({
    '.list-decimal .list-decimal': {
      'list-style-type': 'lower-alpha',
    },
  });
});

/** And another one. our build grids come with some other background implications */
const buildGrids = plugin(({ addUtilities }) => {
  addUtilities({
    '.bg-build-black': {
      'background-size': '56px 56px',
      'background-position': 'center 0',
    },
    '.bg-build-charcoal': {
      'background-size': '56px 56px',
      'background-position': 'center 0',
    },
    '.bg-build-gray': {
      'background-size': '56px 56px',
      'background-position': 'center 0',
    },
    '.bg-build-putty': {
      'background-size': '56px 56px',
      'background-position': 'center 0',
    },
    '.bg-build-white': {
      'background-size': '56px 56px',
      'background-position': 'center 0',
    },
  });
});

const spacing = {
  '1/8': '12.5%',
  '1/6': 'calc(100%/6)',
  0: '0',
  '0.5px': '0.5px',
  '1px': '1px',
  '1.5px': '1.5px',
  '2px': '2px',
  0.125: '0.21875rem', // 3.5px
  0.25: '0.4375rem', // 7px
  0.5: '0.875rem', // 14px
  0.75: '1.3125rem', // 21px
  1: '1.75rem', // 28px
  1.5: '2.625rem', // 42px
  2: '3.5rem', // 56px
  2.5: '4.375rem', // 70px
  3: '5.25rem', // 84px
  3.5: '6.125rem', // 98px
  4: '7rem', // 112px
  4.5: '8.25rem', // 132px
  5: '8.75rem', // 140px
  6: '10.5rem', // 168px
  7: '12.25rem', // 196px
  8: '14rem', // 224px
  9: '15.75rem', // 252px
  10: '17.5rem', // 280px
  11: '19.25rem', // 308px
  12: '21rem', // 336px
  13: '22.75rem', // 364px
  14: '24.5rem', // 392px
  15: '26.25rem', // 420px
  16: '28rem', // 448px
  17: '29.75rem', // 476px
  18: '31.5rem', // 504px
  20: '35rem', // 560px
  21: '36.75rem', // 588px
  22: '38.5rem', // 616px
  24: '42rem', // 672px
  26: '45.5rem', // 728px
  28: '49rem', // 784px
  32: '56rem', // 896px
  36: '63rem', // 1008px
  39: '68.25rem', // 1092px
  48: '80rem', // 1280px
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  plugins: [context, ligatures, darkColorScheme, nestedDecimalLists, buildGrids],
  theme: {
    extend: {
      gridTemplateColumns: ({ theme }) => ({
        // on xs, 1/2 column of padding on either side of our content
        xs: `${theme('spacing[0.5]')} minmax(0, 1fr) ${theme('spacing[0.5]')}`,
        'build-2': `repeat(auto-fill, minmax(0,${theme('spacing.2')}))`, // we use spacing-2 to avoid getting misaligned with the background by half a block
        // on sm, 1 column of padding alongside 16+ columns of content
        sm: `${theme('spacing.1')} minmax(0, 1fr) ${theme('spacing.1')}`,
        // on md, 1 columns of padding alongside 26+ columns of content
        // since it's still 1 cols of spacing, we don't write a special class.
        // on lg, 2 columns of padding alongside 36+ columns of content
        lg: `${theme('spacing.2')} minmax(0, 1fr) ${theme('spacing.2')}`,
        // on xl, 2+ columns of padding, 48 columns of content
        xl: `1fr min(${theme('spacing.48')},100% - ${theme('spacing.4')}) 1fr`,
      }),
      gridAutoRows: {
        build: '28px',
      },
      content: {
        empty: "''",
      },
      minHeight: spacing,
      width: (theme) => ({
        'full-1px': 'calc(100% + 1px)',
        'full-2px': 'calc(100% + 2px)',
        'full-1': `calc(100% + ${theme('spacing.1')})`,
      }),
      height: (theme) => ({
        'full-1px': 'calc(100% + 1px)',
        'full-2px': 'calc(100% + 2px)',
        'full-1': `calc(100% + ${theme('spacing.1')})`,
      }),
      transformOrigin: {
        'left-center': 'left center',
        'right-center': 'right center',
      },
      keyframes: ({ theme }) => ({
        'perspective-spin': {
          '0%': { transform: 'translateZ(calc(var(--mux-logo-perspective) / -4)) rotateY(0deg)' },
          '100%': { transform: 'translateZ(calc(var(--mux-logo-perspective) / -4)) rotateX(90deg)' },
        },
        // todo: replace these animations with --animate-height
        'radix-collapsible-content-down': {
          '0%': { height: 0 },
          '100%': { height: 'var(--radix-collapsible-content-height)' },
        },
        'radix-collapsible-content-up': {
          '0%': { height: 'var(--radix-collapsible-content-height)' },
          '100%': { height: 0 },
        },
        'radix-accordion-content-down': {
          '0%': { height: 0 },
          '100%': { height: 'var(--radix-accordion-content-height)' },
        },
        'radix-accordion-content-up': {
          '0%': { height: 'var(--radix-accordion-content-height)' },
          '100%': { height: 0 },
        },
        'from-right': {
          '0%': { transform: `translate3d(calc(100% + ${theme('spacing.1')}), 0, 0)` },
          '100%': { transform: 'translate3d(0, 0, 0)' },
        },
        'to-right': {
          '0%': { transform: 'translate3d(0, 0, 0)' },
          '100%': { transform: `translate3d(calc(100% + ${theme('spacing.1')}), 0, 0)` },
        },
        'from-top': {
          '0%': { transform: 'translate3d(0, -100%, 0)' },
          '100%': { transform: 'translate3d(0, 0, 0)' },
        },
        'to-top': {
          '0%': { transform: 'translate3d(0, 0, 0)' },
          '100%': { transform: 'translate3d(0, -100%, 0)' },
        },
        'from-bottom': {
          '0%': { transform: 'translate3d(0, 100%, 0)' },
          '100%': { transform: 'translate3d(0, 0, 0)' },
        },
        'from-bottom-0.5': {
          '0%': { transform: `translateY(${theme('spacing[0.5]')})` },
          '100%': { transform: 'translateY(0)' },
        },
        'to-bottom': {
          '0%': { transform: 'translate3d(0, 0, 0)' },
          '100%': { transform: 'translate3d(0, 100%, 0)' },
        },
        appear: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        disappear: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        rotate: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.75)' },
          '100%': { transform: 'scale(1.01)' },
        },
        'scale-out': {
          '0%': { transform: 'scale(1.01)' },
          '100%': { transform: 'scale(1.2)' },
        },
        'clip-in': {
          '0%': { clipPath: 'inset(0 0 100% 0)' },
          '100%': { clipPath: 'inset(0 0 0 0)' },
        },
        'clip-out': {
          '0%': { clipPath: 'inset(0 0 0 0)' },
          '100%': { clipPath: 'inset(0 0 100% 0)' },
        },
        'fly-in': {
          '0%': { transform: 'translateY(100%)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        'fly-in-0.125': {
          '0%': { transform: `translate3d(0, ${theme('spacing[0.125]')}, 0)`, opacity: 0 },
          '100%': { transform: 'translate3d(0, 0, 0)', opacity: 1 },
        },
        'fly-out': {
          '0%': { transform: 'translateY(0)', opacity: 1 },
          '100%': { transform: 'translateY(-100%)', opacity: 0 },
        },
        'fly-out-0.125': {
          '0%': { transform: 'translate3d(0, 0, 0)', opacity: 1 },
          '100%': { transform: `translate3d(0, ${theme('spacing[0.125]')}, 0)`, opacity: 0 },
        },
        'height-down': {
          '0%': { height: 0 },
          '100%': { height: 'var(--animate-height)' },
        },
        'height-up': {
          '0%': { height: 'var(--animate-height)' },
          '100%': { height: 0 },
        },
        blink: {
          '0%': { opacity: 0 },
          '50%': { opacity: 1 },
          '100%': { opacity: 0 },
        },
        'lava-lamp': {
          '0%': { backgroundColor: theme('colors.gray.dark') },
          '45%': { backgroundColor: theme('colors.gray.dark') },
          '60%': { backgroundColor: theme('colors.yellow.DEFAULT') },
          '75%': { backgroundColor: theme('colors.gray.dark') },
          '100%': { backgroundColor: theme('colors.gray.dark') },
        },
        'lava-lamp-light': {
          '0%': { backgroundColor: `var(--mux-lava-lamp-base, ${theme('colors.blue.DEFAULT')})` },
          '19%': { backgroundColor: `var(--mux-lava-lamp-base, ${theme('colors.blue.DEFAULT')})` },
          '34%': { backgroundColor: `var(--mux-lava-lamp-accent, ${theme('colors.pink.DEFAULT')})` },
          '52%': { backgroundColor: `var(--mux-lava-lamp-accent, ${theme('colors.pink.DEFAULT')})` },
          '67%': { backgroundColor: `var(--mux-lava-lamp-accent, ${theme('colors.purple.DEFAULT')})` },
          '85%': { backgroundColor: `var(--mux-lava-lamp-accent, ${theme('colors.purple.DEFAULT')})` },
          '100%': { backgroundColor: `var(--mux-lava-lamp-base, ${theme('colors.blue.DEFAULT')})` },
        },
      }),
      animation: ({ theme }) => ({
        'perspective-spin': `perspective-spin 0.5s ${theme('transitionTimingFunction.in-out-energetic')}`,
        'radix-collapsible-content-down': `radix-collapsible-content-down 0.2s ${theme(
          'transitionTimingFunction.in-out-energetic'
        )}`,
        'radix-collapsible-content-up': `radix-collapsible-content-up 0.2s ${theme(
          'transitionTimingFunction.in-out-energetic'
        )}`,
        'radix-accordion-content-down': `radix-accordion-content-down 0.2s ${theme(
          'transitionTimingFunction.in-out-energetic'
        )}`,
        'radix-accordion-content-up': `radix-accordion-content-up 0.2s ${theme(
          'transitionTimingFunction.in-out-energetic'
        )}`,
        'from-right': `from-right 0.2s ${theme('transitionTimingFunction.in-out-energetic')}`,
        'to-right': `to-right 0.2s ${theme('transitionTimingFunction.in-out-energetic')}`,
        'from-top': `from-top 0.2s ${theme('transitionTimingFunction.in-out-energetic')}`,
        'to-top': `to-top 0.2s ${theme('transitionTimingFunction.in-out-energetic')}`,
        'from-bottom': `from-bottom 0.2s ${theme('transitionTimingFunction.in-out-energetic')}`,
        'from-bottom-0.5': `from-bottom-0.5 0.2s ${theme('transitionTimingFunction.in-out-energetic')}`,
        'to-bottom': `to-bottom 0.2s ${theme('transitionTimingFunction.in-out-energetic')}`,
        appear: `appear 0.2s step-end`,
        'fade-in': `appear 0.2s ${theme('transitionTimingFunction.in-out-energetic')}`,
        disappear: `disappear 0.2s step-end`,
        'fade-out': `disappear 0.2s ${theme('transitionTimingFunction.in-out-energetic')}`,
        'scale-in': `scale-in 0.5s ${theme('transitionTimingFunction.in-out-energetic')}`,
        'scale-in-ease-out': `scale-in 0.15s ${theme('transitionTimingFunction.out-energetic')}`,
        'scale-out': `scale-out 0.5s ${theme('transitionTimingFunction.in-out-energetic')}`,
        'clip-in': `clip-in 0.3s ${theme('transitionTimingFunction.in-out-energetic')}`,
        'clip-out': `clip-out 0.3s ${theme('transitionTimingFunction.in-out-energetic')}`,
        'fly-in': `fly-in 0.3s ${theme('transitionTimingFunction.in-out-energetic')}`,
        'fly-in-0.125': `fly-in-0.125 0.125s ${theme('transitionTimingFunction.in-out-energetic')}`,
        'fly-out': `fly-out 0.3s ${theme('transitionTimingFunction.in-out-energetic')}`,
        'fly-out-0.125': `fly-out-0.125 0.125s ${theme('transitionTimingFunction.in-out-energetic')}`,
        blink: `blink 1s steps(1, end) infinite`,
        'lava-lamp': `lava-lamp 15s ease infinite`,
        'lava-lamp-light': `lava-lamp-light 15s ease infinite`,
      }),
      backgroundImage: {
        'build-black':
          'url("data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgNTYgNTYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgNTZWME0yOCA1NlYwTTU2IDU2VjBNNTYgMjhIME01NiAyOEgwTTU2IDBIME01NiA1NkgwIiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIC8+PC9zdmc+")',
        'build-charcoal':
          'url("data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgNTYgNTYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgNTZWME0yOCA1NlYwTTU2IDU2VjBNNTYgMjhIME01NiAyOEgwTTU2IDBIME01NiA1NkgwIiBmaWxsPSJub25lIiBzdHJva2U9IiMyNDI2MjgiIC8+PC9zdmc+")',
        'build-gray':
          'url("data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgNTYgNTYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgNTZWME0yOCA1NlYwTTU2IDU2VjBNNTYgMjhIME01NiAyOEgwTTU2IDBIME01NiA1NkgwIiBmaWxsPSJub25lIiBzdHJva2U9IiM4MjhDOTciIC8+PC9zdmc+")',
        'build-putty':
          'url("data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgNTYgNTYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHBhdGggZD0iTTAgNTZWME0yOCA1NlYwTTU2IDU2VjBNNTYgMjhIME01NiAyOEgwTTU2IDBIME01NiA1NkgwIiBmaWxsPSJub25lIiBzdHJva2U9IiNlMmU0ZGQiIC8+Cjwvc3ZnPg==")',
        'build-white':
          'url("data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgNTYgNTYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHBhdGggZD0iTTAgNTZWME0yOCA1NlYwTTU2IDU2VjBNNTYgMjhIME01NiAyOEgwTTU2IDBIME01NiA1NkgwIiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIC8+Cjwvc3ZnPg==")',
        'check-dark': `url("data:image/svg+xml;base64,PCEtLSBlbmNvZGUgd2l0aCBodHRwczovL2Jhc2U2NC5ndXJ1L2NvbnZlcnRlci9lbmNvZGUvaW1hZ2Uvc3ZnIGFuZCBhZGQgdG8gdGFpbHdpbmQuY29uZmlnIC0tPgo8c3ZnIHZpZXdCb3g9IjAgMCAyOCAyOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSIxNCIgY3k9IjE0IiByPSIxMy41IiBmaWxsPSIjRjRGNkY0IiBzdHJva2U9IiMwMDAiIC8+CiAgPHBhdGggZD0iTTIxIDlMMTEgMTlsLTQtNSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiAvPgo8L3N2Zz4=")`,
        'check-light': `url("data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjggMjgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHBhdGggZD0iTTIxIDlMMTEgMTlsLTQtNSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiAvPgogIDxjaXJjbGUgY3g9IjE0IiBjeT0iMTQiIHI9IjEzLjUiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgLz4KPC9zdmc+")`,
      },
      supports: {
        dvh: 'height: 100dvh',
        clamp: 'font-size: clamp(100px, 1vw, 200px)',
      },
      zIndex: {
        60: '60',
      },
    },
    fontFamily: {
      display: "Rotonto, 'Rotonto Fallback'",
      body: "Aeonik,  'Aeonik Fallback'",
      mono: "'JetBrains Mono', 'JetBrains Mono Fallback'",
    },
    lineHeight: {
      heading: '1.15',
      'heading-2': '1.2',
      'heading-4': '1.4',
      mono: '1.2',
      code: '1.6',
      normal: '1.5',
      1: '1.75rem',
    },
    letterSpacing: {
      normal: '0em',
      wide: '0.02em',
    },
    fontSize: {
      // todo: how cool would it be to use vw here? It'll just take some thinking on how to provide fallbacks
      '6xl': '4.125rem', // 66px
      '5xl': '3.125rem', // 50px
      '4xl': '2.25rem', // 36px
      '3xl': '2rem', // 32px
      '2xl': '1.75rem', // 28px
      xl: '1.5rem', // 24px
      lg: '1.3125rem', // 21px
      md: '1.125rem', // 18px
      base: '1rem', // 16px
      sm: '0.875rem', // 14px
      xs: '0.75rem', // 12px
    },
    transitionTimingFunction: {
      'in-out-energetic': 'cubic-bezier(.7,0,.3,1)',
      'out-energetic': 'cubic-bezier(.2,.3,.65,1)',
    },
    transitionDuration: {
      short: '0.12s',
      medium: '0.2s',
      long: '0.24s',
      'even-longer': '0.3s',
    },
    screens: {
      // only use px here.
      // if you update screens, you may have to update
      // -> mux.com/app/_components/NextImage
      xs: '0px',
      sm: '504px', // 1/16/1 (18)
      md: '784px', // 1/26/1 (28)
      lg: '1176px', // 2/38/2 (42)
      xl: '1456px', // 2/48/2 (52)
    },
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      putty: {
        light: '#F4F6F4',
        DEFAULT: '#e2e4dd',
        deep: '#d0d2c8',
      },
      white: '#ffffff',
      gray: {
        DEFAULT: '#828C97',
        underline: '#707A85',
        dark: '#565e67',
        'text-dark': '#adb9c6',
      },
      charcoal: '#242628',
      black: '#000000',
      orange: {
        neon: '#ff8e0a',
        DEFAULT: '#ff6100',
        dark: '#ba4300',
      },
      pink: {
        neon: '#fb68ec',
        DEFAULT: '#fa50b5',
        dark: '#b14886',
      },
      red: {
        neon: '#ff5c38',
        DEFAULT: '#ea3737',
        dark: '#ba1704',
      },
      yellow: {
        neon: '#ffdb08',
        DEFAULT: '#ffb200',
        dark: '#bd8209',
      },
      green: {
        neon: '#1be349',
        DEFAULT: '#00BE43',
        dark: '#00802d',
      },
      blue: {
        neon: '#16a6ff',
        DEFAULT: '#0482FF',
        dark: '#004e9b',
      },
      purple: {
        neon: '#cb75ff',
        DEFAULT: '#ac39f2',
        dark: '#7c32ab',
      },
    },
    borderRadius: {
      none: '0',
      0.25: '0.4375rem', // 7px
      0.5: '0.875rem', // 14px
      1: '1.75rem', // 28px
      1.5: '2.625rem', // 42px
      2: '3.5rem', // 56px
      4: '7rem', // 112px
    },
    spacing,
    textUnderlineOffset: {
      mono: '0.125em', // leading 1.2
      heading: '0.22em', // leading 1.15
      'heading-2': '0.23em', // leading 1.2
      'heading-4': '0.28em', // leading 1.4
      normal: '0.3em', // leading 1.5
      code: '0.125em', // leading 1.6
    },
    textDecorationThickness: {
      link: 'max(0.05em,0.05rem)',
    },
    minWidth: {
      none: 'none',
      ...spacing,
    },
    maxWidth: {
      none: 'none',
      ...spacing,
    },
  },
};
