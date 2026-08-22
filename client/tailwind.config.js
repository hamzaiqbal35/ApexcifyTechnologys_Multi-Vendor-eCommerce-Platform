/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        'brand-orange': '#E85002',
        'brand-black': '#000000',
        'brand-white': '#F9F9F9',
        'brand-gray': '#646464',
        'brand-light-gray': '#A7A7A7',
        'brand-dark-gray': '#333333',
        background: '#F9F9F9',
        foreground: '#000000',
        muted: '#f5f5f5',
        'muted-foreground': '#646464',
        border: '#A7A7A7',
        primary: '#E85002',
        'primary-foreground': '#ffffff',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #000000, #C10801, #F16001, #D9C3AB)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        slideUp: {
          from: { opacity: 0, transform: 'translateY(10px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      }
    },
  },
  plugins: [],
}
