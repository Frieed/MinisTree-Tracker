export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nature: {
          brown: {
            light: '#D2B48C',
            DEFAULT: '#8B7355',
            dark: '#A0522D',
          },
          green: {
            light: '#8FBC8F',
            DEFAULT: '#6B8E23',
            dark: '#4A7C59',
          },
          cream: {
            light: '#FDF8F0',
            DEFAULT: '#FAF5EE',
          }
        }
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'premium': '0 10px 30px -5px rgba(107, 142, 35, 0.1), 0 4px 10px -2px rgba(107, 142, 35, 0.05)',
      }
    },
  },
  plugins: [],
}
