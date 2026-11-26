/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html','./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        grotesk: ['"Space Grotesk"','Helvetica Neue','sans-serif'],
        mono:    ['"Space Mono"','Courier New','monospace'],
      },
      colors: { 'ant-black':'#000000', 'ant-white':'#FFFFFF', 'ant-gray':'#888888' },
      letterSpacing: { editorial:'-0.03em', tight2:'-0.02em' },
    },
  },
};
