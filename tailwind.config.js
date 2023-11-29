/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      transitionTimingFunction: {
        'lottery': 'cubic-bezier(0.075, 0.82, 0.165, 1)',
      }
    },
  },
  plugins: [],
}