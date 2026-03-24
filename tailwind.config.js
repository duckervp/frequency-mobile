/** @type {import('tailwindcss').Config} */
module.exports = {
  // NativeWind v4 uses content from app/ and src/ directories
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#2bee79',
        'background-light': '#f6f8f7',
        'background-dark': '#102217',
      },
      fontFamily: {
        display: ['Lexend_400Regular', 'Lexend_500Medium', 'Lexend_700Bold'],
      },
    },
  },
  plugins: [],
};
