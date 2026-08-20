import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bul: {
          red: '#E63329', red2: '#C31F16',
          yellow: '#FFD400', yellow2: '#FFB800',
          cream: '#FFF3E2', ink: '#121212',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
      },
      boxShadow: {
        // «мультяшна» жорстка тінь зі зміщенням
        pop: '5px 5px 0 0 #121212',
        'pop-lg': '8px 8px 0 0 #121212',
      },
      keyframes: {
        'fade-up': { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'none' } },
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'float':   { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
      },
      animation: {
        'fade-up': 'fade-up .7s cubic-bezier(.16,1,.3,1) both',
        'fade-in': 'fade-in .5s ease both',
        'float':   'float 5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
export default config;
