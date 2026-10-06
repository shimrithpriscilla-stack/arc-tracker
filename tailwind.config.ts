import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#FF6B35', dark: '#E55A24', light: '#FF8C5A' },
        surface: '#1A1A2E',
        card: '#16213E',
        'card-hover': '#1E2D55',
        muted: '#9CA3AF',
        protein: '#FF6B6B',
        carbs: '#4ECDC4',
        fat: '#FFE66D',
        fiber: '#A8E6CF',
        water: '#74B9FF',
      },
    },
  },
  plugins: [],
}

export default config
