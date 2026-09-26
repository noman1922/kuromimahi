/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'midnight-black': '#100C12',
        'charcoal-plum': '#1D1420',
        'deep-cherry': '#351726',
        'cherry-hover': '#451D32',
        'dusty-rose': '#C86F91',
        'soft-blush': '#F1B6CD',
        'warm-cream': '#F6EBDD',
        'muted-mauve': '#9F8998',
        // Semantic surface shades
        surface: {
          base: '#100C12',
          subtle: '#150F18',
          card: '#1D1420',
          elevated: '#261A2B',
          border: '#351726',
          borderLight: '#4E243B',
        }
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', '"Silkscreen"', 'monospace'],
        silkscreen: ['"Silkscreen"', '"Press Start 2P"', 'monospace'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        handwritten: ['"Caveat"', 'cursive'],
      },
      boxShadow: {
        'goth-glow': '0 0 25px -5px rgba(200, 111, 145, 0.25)',
        'cherry-glow': '0 0 35px -5px rgba(53, 23, 38, 0.6)',
        'card-hover': '0 12px 30px -8px rgba(16, 12, 18, 0.9), 0 0 20px 0 rgba(200, 111, 145, 0.15)',
        'pixel-tag': '2px 2px 0px #100C12',
        'pixel-box': '3px 3px 0px #351726',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-gentle': 'floatGentle 6s ease-in-out infinite',
        'sparkle': 'sparkle 2s ease-in-out infinite',
      },
      keyframes: {
        floatGentle: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        sparkle: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(0.95)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        }
      }
    },
  },
  plugins: [],
}
