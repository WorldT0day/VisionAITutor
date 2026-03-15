/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-base': '#0d0f12',
        'bg-surface': '#161b22',
        'bg-elevated': '#1e242d',
        'accent-primary': '#00b4d8',
        'accent-danger': '#ef4444',
        'accent-live': '#22c55e',
        'text-primary': '#f1f5f9',
        'text-muted': '#64748b',
        'border-dim': '#2d3748',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
