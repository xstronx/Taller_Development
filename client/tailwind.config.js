// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#082B70',
          yellow: '#FFD900',
          background: '#F3F4F6',
          surface: '#FFFFFF',
          danger: '#E21B23',
        },
      },
    },
  },
  plugins: [],
}
