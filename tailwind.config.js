
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./{components,hooks,services,App,index}.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
