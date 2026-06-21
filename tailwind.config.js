/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        page: 'var(--bg-page)',
        card: 'var(--bg-card)',
        surface: 'var(--bg-surface)',
        muted: 'var(--text-muted)',
        accent: 'var(--text-accent)',
        divider: 'var(--border-color)',
      },
    },
  },
  plugins: [],
}
