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
          yellow: '#FFD900',
          blue: '#0057B8',
          navy: '#003B8F',
          red: '#E21B23',
          black: '#050505',
          white: '#FFFFFF',
        },
      },
    },
  },
  plugins: [],
}
