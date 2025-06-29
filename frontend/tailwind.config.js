/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Space Grotesk', 'Noto Sans', 'sans-serif'],
      },
      colors: {
        'pearl-primary': '#1E40AF',
        'pearl-accent': '#3B82F6',
        'pearl-bg-dark': '#000000',
        'pearl-bg-medium': '#0A0A0A',
        'pearl-bg-light': '#1A1A1A',
        'pearl-text': '#E8F4FF',
        'pearl-text-muted': '#64748B',
        'pearl-border': '#1E293B',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-glow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      boxShadow: {
        'pearl-glow': '0 0 20px rgba(30, 64, 175, 0.3)',
        'pearl-glow-strong': '0 0 30px rgba(30, 64, 175, 0.5)',
      }
    },
  },
  plugins: [],
} 