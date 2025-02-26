import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],

  theme: {
    fontFamily: {
      sans: ['SF Mono', 'sans-serif']
    },
    extend: {}
  },

  plugins: []
} satisfies Config;
