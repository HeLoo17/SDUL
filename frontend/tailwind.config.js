/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/***/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        't1': '#8B90A1',
        't2': '#414755',
        't3':'#A9C7FF',
        'dodgerBlue': '#3C90FF',
        'warning': '#FE651E',
        'notice': '#A6B6D5',
        'critical': '#93000A',
        'primary': {
          DEFAULT: '#0f131c',
          BACK: '#1C1F29',
        },
        'graph' : {
          TITLE: '#DFE2EF',
          LEGEND: '#C1C6D7',
          CPU: '#A9C7FF',
          RAM: '#B7C7E7',
        },

      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        space: ["'Space Grotesk'", 'sans'],
      },
    },
  },
  plugins: [],
}

