/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#10b981',  // emerald-500
          light: '#34d399',    // emerald-400
          dark: '#059669',     // emerald-600
        },
        navy: {
          DEFAULT: '#1a1f36',
          light: '#252b42',
          dark: '#0f1419',
        },
        gold: {
          DEFAULT: '#f59e0b',  // amber-500
          light: '#fbbf24',    // amber-400
          dark: '#d97706',     // amber-600
        },
      },
      backgroundColor: theme => ({
        ...theme('colors'),
      }),
      fontFamily: {
        // make Poppins available as the primary sans font
        sans: ["Poppins", "Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "Noto Sans", "sans-serif"],
      },
      textColor: theme => ({
        ...theme('colors'),
      }),
      gradientColorStops: theme => ({
        ...theme('colors'),
      }),
      animation: {
        'blob': 'blob 7s infinite',
        'scroll': 'scroll 2s ease-in-out infinite',
        'fade-in-down': 'fade-in-down 0.6s ease-out',
        'fade-in-up': 'fade-in-up 0.6s ease-out',
        'gradient': 'gradient 3s ease infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        blob: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '25%': { transform: 'translate(20px, -50px) scale(1.1)' },
          '50%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '75%': { transform: 'translate(50px, 50px) scale(1.05)' }
        },
        scroll: {
          '0%': { opacity: '0', transform: 'translateY(0)' },
          '40%': { opacity: '1' },
          '100%': { opacity: '0', transform: 'translateY(16px)' }
        },
        'fade-in-down': {
          'from': { opacity: '0', transform: 'translateY(-20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' }
        },
        'fade-in-up': {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' }
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' }
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.5' }
        }
      },
      backgroundSize: {
        'auto': 'auto',
        'cover': 'cover',
        'contain': 'contain',
        '200%': '200% auto',
      },
      animationDelay: {
        '200': '0.2s',
        '400': '0.4s',
        '600': '0.6s',
        '2000': '2s',
        '4000': '4s',
      },
      animationFillMode: {
        'both': 'both'
      }
    }
  },
  plugins: [
    function({ addUtilities, theme }) {
      const animationDelays = theme('animationDelay', {});
      const utilities = Object.entries(animationDelays).reduce((acc, [key, value]) => {
        acc[`.animation-delay-${key}`] = {
          'animation-delay': value,
          'animation-fill-mode': 'both'
        };
        return acc;
      }, {});
      addUtilities(utilities);
    }
  ]
}