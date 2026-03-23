/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nyang: {
          50: '#fff3e8',
          100: '#ffe3c8',
          200: '#ffcca1',
          300: '#ffaf71',
          400: '#ff8a3a',
          500: '#f4a261',
          600: '#e07628',
          700: '#bc5620',
        }
      },
      fontFamily: {
        sans: ['"Pretendard Variable"', 'Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Roboto', '"Helvetica Neue"', '"Segoe UI"', '"Apple SD Gothic Neo"', '"Noto Sans KR"', '"Malgun Gothic"', '"Apple Color Emoji"', '"Segoe UI Emoji"', '"Segoe UI Symbol"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
