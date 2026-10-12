/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    screens: { sm: '640px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1536px' },
    extend: {
      colors: {
        brand: {
          primary: 'var(--brand-primary)',
          'primary-light': 'var(--brand-primary-light)',
          'primary-dark': 'var(--brand-primary-dark)',
          accent: 'var(--brand-accent)',
          'accent-light': 'var(--brand-accent-light)',
          'accent-dark': 'var(--brand-accent-dark)',
        },
        navy: {
          50: '#eef2ff', 100: '#dde6ff', 200: '#bdd0ff', 300: '#8eb0ff',
          400: '#5b83f8', 500: '#3b5bdb', 600: 'var(--color-navy-600)', 700: 'var(--color-navy-700)',
          800: '#172554', 900: '#0f172a', 950: '#060d1f',
        },
        teal: {
          50: '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4', 300: '#5eead4',
          400: '#2dd4bf', 500: 'var(--color-teal-500)', 600: '#0d9488', 700: '#0f766e',
          800: '#115e59', 900: '#134e4a',
        },
        amber: {
          50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d',
          400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309',
        },
        emerald: {
          50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 400: '#34d399',
          500: '#10b981', 600: '#059669', 700: '#047857',
        },
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'sans-serif'],
        body:    ['var(--font-body)', 'sans-serif'],
      },
      borderRadius: { card: 'var(--radius-card)', control: 'var(--radius-control)' },
      maxWidth: { content: '75rem' },
      boxShadow: {
        'xs': '0 1px 2px 0 rgb(0 0 0 / 0.04)',
        'navy-md': '0 4px 20px -4px rgb(30 58 138 / 0.18)',
        'navy-lg': '0 8px 32px -6px rgb(30 58 138 / 0.22)',
        'focus': '0 0 0 3px rgb(30 58 138 / 0.35)',
        'focus-accent': '0 0 0 3px rgb(20 184 166 / 0.35)',
        card: 'var(--shadow-card)',
      },
      keyframes: {
        'fade-in': { '0%': { opacity: '0', transform: 'translateY(4px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'slide-up': { '0%': { opacity: '0', transform: 'translateY(12px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        'toast-enter': { '0%': { opacity: '0', transform: 'translateX(100%)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        'toast-exit': { '0%': { opacity: '1', transform: 'translateX(0)' }, '100%': { opacity: '0', transform: 'translateX(100%)' } },
        'spin-slow': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out both',
        'slide-up': 'slide-up 0.25s ease-out both',
        shimmer: 'shimmer 1.6s linear infinite',
        'toast-enter': 'toast-enter 0.3s ease-out both',
        'toast-exit': 'toast-exit 0.25s ease-in both',
        'spin-slow': 'spin-slow 0.9s linear infinite',
      },
    },
  },
  plugins: [],
};
