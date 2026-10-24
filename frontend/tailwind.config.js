/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Lora', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', '"Be Vietnam Pro"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        terracotta: {
          DEFAULT: '#B85D3B',
          hover: '#9E4C2E',
          light: '#C86D4D'
        },
        moss: {
          DEFAULT: '#1C382B',
          dark: '#14291F',
          light: '#2D4F3E'
        },
        sand: {
          50: '#FDFCF7',
          100: '#F8F5EE',
          200: '#EFECE6',
          300: '#E4DFD5'
        }
      }
    },
  },
  plugins: [],
}
