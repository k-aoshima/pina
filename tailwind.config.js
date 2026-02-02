/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'pina-yellow': '#FFD60A',
        'pina-navy': '#1E3A8A',
        'pina-pink': '#EC4899',
      },
      boxShadow: {
        brutal: '8px 8px 0px 0px rgba(0,0,0,1)',
        'brutal-sm': '4px 4px 0px 0px rgba(0,0,0,1)',
        'brutal-lg': '12px 12px 0px 0px rgba(0,0,0,1)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'bounce-toy': 'bounce 1s infinite',
        marquee: 'marquee 25s linear infinite',
      },
    },
  },
  plugins: [],
}
