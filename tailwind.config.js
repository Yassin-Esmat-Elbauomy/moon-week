/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        spaceBlue: '#263C75',
        skyBlue: '#79C8E8',
        softPurple: '#A995E8',
        sunshineYellow: '#FFD66B',
        mintGreen: '#9BD8A7',
        lunarNavy: '#0F172A',
      },
      fontFamily: {
        display: ['Fredoka', 'system-ui', 'sans-serif'],
        body: ['Nunito', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
