/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#131313',
          dim: '#0e0e0e',
          lowest: '#0a0a0a',
          container: '#201f1f',
          'container-low': '#1c1b1b',
          'container-high': '#2a2a2a',
          'container-highest': '#353534',
          bright: '#3a3939',
          variant: '#353534',
        },
        primary: {
          DEFAULT: '#c9bfff',
          container: '#917eff',
          fixed: '#e5deff',
          'fixed-dim': '#c9bfff',
        },
        secondary: {
          DEFAULT: '#fff9ef',
          container: '#ffdb3c',
          fixed: '#ffe16d',
          'fixed-dim': '#e9c400',
        },
        'on-surface': {
          DEFAULT: '#e5e2e1',
          variant: '#c9c4d8',
        },
        'on-primary': {
          DEFAULT: '#2e009c',
          container: '#28008a',
          fixed: '#1a0063',
          'fixed-variant': '#441cc8',
        },
        'on-secondary': {
          DEFAULT: '#3a3000',
          container: '#725f00',
          fixed: '#221b00',
          'fixed-variant': '#544600',
        },
        outline: {
          DEFAULT: '#928ea1',
          variant: '#484555',
        },
        error: {
          DEFAULT: '#ffb4ab',
          container: '#93000a',
        },
        tertiary: {
          DEFAULT: '#c6c6c7',
          container: '#909191',
          fixed: '#e2e2e2',
          'fixed-dim': '#c6c6c7',
        },
        inverse: {
          surface: '#e5e2e1',
          'on-surface': '#313030',
          primary: '#5d3fe0',
        },
        // Shorthand accent colors
        gold: '#ffdb3c',
        violet: '#7b61ff',
        lavender: '#c9bfff',
        cream: '#fff9ef',
      },
      fontFamily: {
        headline: ['Newsreader', 'serif'],
        body: ['Inter', 'sans-serif'],
        label: ['Space Grotesk', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.125rem',
        lg: '0.25rem',
        xl: '0.5rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'spin-slow': 'spin 20s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'fade-up': 'fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
        'page-enter': 'page-enter 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'result-glow': 'result-glow 0.6s ease-out',
        'click-pulse': 'click-pulse 0.3s ease-out',
        'float-orb': 'float-orb 8s ease-in-out infinite',
        'draw-line': 'draw-line 0.8s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(123, 97, 255, 0.1)' },
          '50%': { boxShadow: '0 0 40px rgba(123, 97, 255, 0.3)' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'page-enter': {
          from: { opacity: '0', transform: 'translateY(12px) scale(0.99)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'result-glow': {
          '0%': { boxShadow: '0 0 0 0 rgba(123, 97, 255, 0.4)' },
          '50%': { boxShadow: '0 0 30px 10px rgba(123, 97, 255, 0.2)' },
          '100%': { boxShadow: '0 0 0 0 rgba(123, 97, 255, 0)' },
        },
        'click-pulse': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
        'float-orb': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '25%': { transform: 'translate(30px, -20px) scale(1.05)' },
          '50%': { transform: 'translate(-20px, 20px) scale(0.95)' },
          '75%': { transform: 'translate(10px, -10px) scale(1.02)' },
        },
        'draw-line': {
          from: { strokeDashoffset: '400' },
          to: { strokeDashoffset: '0' },
        },
      },
    },
  },
  plugins: [],
}
