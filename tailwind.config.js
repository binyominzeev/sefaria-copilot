/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        torah: {
          50: '#faf8f3',
          100: '#f4f0e6',
          200: '#e8dfc7',
          300: '#d9ca9f',
          400: '#c7b275',
          500: '#b89f56',
          600: '#a18947',
          700: '#866f3c',
          800: '#6e5b36',
          900: '#5c4c30',
        },
        sefaria: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        }
      },
      fontFamily: {
        hebrew: ['SBL Hebrew', 'Times New Roman', 'serif'],
        english: ['Georgia', 'Times New Roman', 'serif'],
      },
      fontSize: {
        'torah': ['18px', '1.6'],
      }
    },
  },
  plugins: [],
}