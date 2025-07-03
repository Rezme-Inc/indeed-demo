/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
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
    },
  },
  plugins: [],
};
