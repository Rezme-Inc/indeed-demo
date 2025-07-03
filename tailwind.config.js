/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    screens: {
      'xs': '480px',    // Extra small devices
      'sm': '640px',    // Small tablets
      'md': '768px',    // Tablets
      'lg': '1024px',   // Laptops/Desktops
      'xl': '1280px',   // Large screens
    },
    extend: {
      colors: {
        primary: '#E54747',    // Cinnabar Red
        secondary: '#595959',  // Gray35
        background: '#FFFFFF', // White
        foreground: '#000000', // Black
      },
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      typography: {
        DEFAULT: {
          css: {
            fontSize: 'clamp(1rem, 1vw + 0.75rem, 1.125rem)',
            lineHeight: '1.5',
          },
        },
      },
      maxWidth: {
        'drawer': '80vw',
      },
      animation: {
        'slide-in': 'slide-in 0.3s ease-out',
        'slide-out': 'slide-out 0.3s ease-in',
      },
      keyframes: {
        'slide-in': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-out': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
