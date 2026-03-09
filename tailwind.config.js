/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        edueats: {
          bg: '#E6F5E9', // soft mint background
          surface: '#FFF7EB', // light card background
          surfaceAlt: '#FFEFD5', // alternate card/header surface
          primary: '#FECF5B', // warm yellow header
          primaryDeep: '#F7B500', // stronger yellow accents
          accent: '#F76B45', // orange CTAs and bottom nav
          accentSoft: '#FFD8C2', // soft orange highlights
          text: '#3C2A21', // main dark text
          textMuted: '#8C7A70', // secondary text
          border: '#E0D2C2', // soft card borders
          success: '#3BB273',
          danger: '#E45858',
        },
      },
      borderRadius: {
        card: '1.25rem',
      },
      boxShadow: {
        card: '0 8px 18px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
};
