/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'Nunito', 'system-ui', 'sans-serif'],
      },
      colors: {
        /* Palette principale stile Serenis */
        'tst-primary': '#7a59f5',
        'tst-primary-soft': '#8f73ff',
        'tst-ink': '#1c1c36',
        'tst-muted': '#6a6a98',
        'tst-mint': '#8ce6d0',
        'tst-surface': '#f6f7fd',
        /* Famiglie report (restano disponibili per grafici) */
        'tst-blu': '#3b82f6',
        'tst-rosso': '#ef4444',
        'tst-verde': '#22c55e',
        'tst-giallo': '#eab308',
        'tst-grigio': '#6b7280',
      },
      boxShadow: {
        serene: '0 14px 44px rgba(28, 28, 54, 0.08)',
        'serene-lg': '0 26px 70px rgba(28, 28, 54, 0.10)',
      },
    },
  },
  plugins: [],
}
