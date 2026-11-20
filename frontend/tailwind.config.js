/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#166534',
          50: '#f0fdf4',
          100: '#dcfce7',
          600: '#15803d',
          700: '#166534',
          800: '#14532d',
          900: '#052e16',
        },
        fresh: {
          DEFAULT: '#22c55e',
          light: '#86efac',
          dark: '#16a34a',
        },
        golden: {
          DEFAULT: '#eab308',
          light: '#fde047',
          dark: '#ca8a04',
        },
        agro: {
          50: '#f2fbf5',
          100: '#e1f7e9',
          200: '#c5eed4',
          300: '#99dfb4',
          400: '#64c78d',
          500: '#3da86c',
          600: '#2c8753',
          700: '#246b44',
          800: '#205538',
          900: '#1b4730',
          950: '#0c2719',
        },
        harvest: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        }
      },
    },
  },
  plugins: [],
};
