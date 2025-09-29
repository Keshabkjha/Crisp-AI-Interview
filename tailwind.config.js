/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./{components,hooks,services,types,constants,App,index}.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {},
    },
    plugins: [],
  }
  