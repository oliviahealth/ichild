/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        tungsten: ['Tungsten', 'sans-serif']
      },
      scale: {
        '101': '1.01'
      },
      colors: {
        lightgrey: '#d3d3d3'
      }
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        mytheme: {
          "primary": "#661429",
          "secondary": "#003c71",
          "neutral": "#3d4451",
        }
      }
    ]
  }
}