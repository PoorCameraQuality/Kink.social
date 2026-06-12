/**
 * @deprecated Stale — not used by the Vite web app build.
 *
 * Active Tailwind config: packages/web/tailwind.config.js
 * (PostCSS in packages/web resolves tailwind from that package root.)
 *
 * This file predates the monorepo layout (Next.js-style ./src paths, Inter fonts,
 * hardcoded c2k hex). Do not edit for new UI work. Safe removal is deferred until
 * no tooling references this path — see docs/design/08-DESIGN_TOKENS.md.
 */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        c2k: {
          bg: {
            DEFAULT: '#0f0f0f',
            card: '#1a1a1a',
            elevated: '#252525',
            charcoal: '#2d2d2d',
          },
          accent: {
            primary: '#14b8a6',
            'primary-hover': '#0d9488',
            secondary: '#22d3ee',
            'secondary-hover': '#06b6d4',
          },
          text: {
            primary: '#ffffff',
            secondary: '#a3a3a3',
            muted: '#737373',
          },
          danger: 'var(--c2k-danger)',
          success: 'var(--c2k-success)',
          warning: 'var(--c2k-warning)',
        },
      },
      borderRadius: {
        'c2k-card': '1rem',
      },
      boxShadow: {
        'c2k-soft': '0 4px 6px -1px rgb(0 0 0 / 0.2), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
