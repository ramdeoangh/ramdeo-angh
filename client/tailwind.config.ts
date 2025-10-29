import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    '../packages/ui/src/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {}
  },
  darkMode: 'class',
  plugins: []
} satisfies Config;


