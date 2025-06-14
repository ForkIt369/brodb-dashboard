import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Bro Green Palette
        'bro': {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#30D158', // Primary
          600: '#1FB848', // Dark
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        // W3DV Colors
        'w3dv': {
          blue: '#00D4FF',
          purple: '#9D4EDD',
          orange: '#FF9500',
          red: '#FF3B30',
        },
        // Dark backgrounds
        'dark': {
          primary: '#0A0E0F',
          secondary: '#0D1117',
          tertiary: '#161B22',
          hover: '#21262D',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
export default config