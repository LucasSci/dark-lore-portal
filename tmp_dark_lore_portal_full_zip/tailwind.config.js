/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primaryDark: '#0a0a0c',
        secondaryDark: '#111115',
        tertiaryDark: '#1b1b22',
        antiqueGold: '#c9a15a',
        softAmber: '#ffcc66',
        deepCrimson: '#5c1f1f'
      },
      fontFamily: {
        display: ['Cinzel', 'serif'],
        body: ['Lora', 'serif']
      },
      backgroundImage: {
        'parchment': "url('/images/parchment_texture.png')",
        'hero': "url('/images/hero_background.png')",
        'world': "url('/images/world_illustration.png')"
      }
    }
  },
  plugins: []
};