/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./**/*.{html,js}'],
  theme: {
    extend: {
      colors: {
        // todo: needs more sub variants because slate-500, slate-700 and slate-900 is used.
        //       ideally 3 shades of each color would be created via CSS.
        // primary: 'var(--media-primary-color, rgb(51 65 85 / var(--tw-bg-opacity)))',
        secondary: 'var(--media-secondary-color, #fff)',
        accent: 'var(--media-accent-color, rgb(79 70 229))',
      },
    },
  },
  plugins: [require('@tailwindcss/container-queries')],
};
