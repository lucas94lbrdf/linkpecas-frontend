/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        orange: {
          DEFAULT: '#ff6b35',
          dark: '#e85a24',
        },
        orange2: '#e85a24',
        blue: {
          DEFAULT: '#3b82f6',
          dark: '#2563eb',
        },
      },
      fontFamily: {
        sora: ['Sora', 'sans-serif'],
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease-out both',
        'float': 'float 4.5s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          'from': { opacity: '0', transform: 'translateY(16px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-14px) rotate(4deg)' },
        }
      }
    },
  },
  plugins: [],
}
