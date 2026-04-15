/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        // Dark theme surfaces
        dark: {
          900: '#080c14',
          800: '#0d1221',
          700: '#111827',
          600: '#1a2235',
          500: '#1e2a42',
          400: '#243352',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.08)',
        'glass': '0 8px 32px 0 rgba(0,0,0,0.4)',
        'glow-indigo': '0 0 20px rgba(99,102,241,0.4)',
        'glow-emerald': '0 0 20px rgba(16,185,129,0.4)',
        'glow-amber': '0 0 20px rgba(245,158,11,0.4)',
        'glow-violet': '0 0 20px rgba(139,92,246,0.4)',
        'glow-teal': '0 0 20px rgba(20,184,166,0.4)',
        'glow-rose': '0 0 20px rgba(244,63,94,0.4)',
        'glow-cyan': '0 0 20px rgba(6,182,212,0.4)',
        'glow-orange': '0 0 20px rgba(249,115,22,0.4)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      backgroundImage: {
        'mesh-dark': 'radial-gradient(at 40% 20%, rgba(99,102,241,0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(139,92,246,0.1) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(16,185,129,0.07) 0px, transparent 50%), radial-gradient(at 80% 50%, rgba(99,102,241,0.05) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(99,102,241,0.1) 0px, transparent 50%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glow: {
          '0%': { opacity: '0.7' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
