// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary colors based on your logo
        primary: {
          DEFAULT: '#0066FF',      // Main brand blue
          dark: '#0052CC',         // Darker blue for hover states
          light: '#3385FF',        // Lighter blue for accents
        },
        // Navy colors from your logo background
        navy: {
          DEFAULT: '#1a2d5e',      // Main navy from logo
          light: '#2d3748',        // Lighter navy for secondary text
          dark: '#0f1729',         // Darker navy
        },
        // Lavender from your logo text
        lavender: {
          DEFAULT: '#b8b3ff',      // Main lavender accent
          light: '#d4d0ff',        // Lighter lavender
          dark: '#9c96e6',         // Darker lavender
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundSize: {
        'size-200': '200% 200%',
      },
      backgroundPosition: {
        'pos-0': '0% 0%',
        'pos-100': '100% 100%',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'fade-in-down': 'fadeInDown 0.6s ease-out',
        'blob': 'blob 7s infinite',
        'scroll': 'scroll 1.5s ease-in-out infinite',
        'gradient': 'gradient 8s ease infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(30px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        fadeInDown: {
          '0%': {
            opacity: '0',
            transform: 'translateY(-30px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        blob: {
          '0%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)',
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)',
          },
          '100%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
        },
        scroll: {
          '0%': {
            transform: 'translateY(0)',
            opacity: '0',
          },
          '40%': {
            opacity: '1',
          },
          '80%': {
            transform: 'translateY(12px)',
            opacity: '0',
          },
          '100%': {
            opacity: '0',
          },
        },
        gradient: {
          '0%, 100%': {
            backgroundPosition: '0% 50%',
          },
          '50%': {
            backgroundPosition: '100% 50%',
          },
        },
      },
    },
  },
  plugins: [],
}