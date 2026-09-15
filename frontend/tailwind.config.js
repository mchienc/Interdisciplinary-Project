/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'Lora', '"Times New Roman"', 'serif'],
        sans: ['"Plus Jakarta Sans"', '"Be Vietnam Pro"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        terracotta: {
          DEFAULT: '#A85232',
          hover: '#8E4226',
          light: '#C86D4D'
        },
        moss: {
          DEFAULT: '#1C382B',
          dark: '#14291F'
        },
        sand: {
          50: '#FDFBF7',
          100: '#F8F5EE',
          200: '#EFECE6',
          300: '#E4DFD5'
        },
        slate: {
          750: '#1E293B',
          850: '#0F172A',
          950: '#0B0F19',
        }
      }
    },
  },
  plugins: [],
}
