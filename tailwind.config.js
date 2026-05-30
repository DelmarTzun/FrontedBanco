/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        brand: {
          50: '#f1efff',
          100: '#e4e0ff',
          200: '#cac1ff',
          300: '#a89aff',
          400: '#8b78ff',
          500: '#6d5dfb',
          600: '#5a48e8',
          700: '#4a3acb',
          800: '#3d31a3',
          900: '#2d2476',
        },
        accent: {
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
        },
        ink: {
          50: '#f7f7fb',
          100: '#eeeef5',
          200: '#d6d6e3',
          300: '#a4a4be',
          400: '#7a7a96',
          500: '#535374',
          600: '#3a3a54',
          700: '#272739',
          800: '#161624',
          900: '#0c0c16',
        },
      },
      boxShadow: {
        soft: '0 8px 24px -8px rgba(15, 15, 35, 0.12)',
        glow: '0 12px 40px -10px rgba(109, 93, 251, 0.5)',
        glass: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 16px 48px -16px rgba(0,0,0,0.4)',
      },
      backgroundImage: {
        'mesh-light':
          'radial-gradient(at 12% 18%, rgba(109,93,251,0.18) 0px, transparent 50%), radial-gradient(at 88% 8%, rgba(34,211,238,0.18) 0px, transparent 45%), radial-gradient(at 70% 92%, rgba(244,114,182,0.14) 0px, transparent 55%)',
        'mesh-dark':
          'radial-gradient(at 12% 18%, rgba(109,93,251,0.28) 0px, transparent 50%), radial-gradient(at 88% 8%, rgba(34,211,238,0.18) 0px, transparent 45%), radial-gradient(at 70% 92%, rgba(244,114,182,0.10) 0px, transparent 55%)',
        'gradient-brand': 'linear-gradient(135deg, #6d5dfb 0%, #8b78ff 50%, #22d3ee 100%)',
        'gradient-card': 'linear-gradient(135deg, #1c1c2e 0%, #2d2476 60%, #6d5dfb 100%)',
        'gradient-card-alt': 'linear-gradient(135deg, #0c0c16 0%, #3d31a3 50%, #22d3ee 110%)',
        'shimmer':
          'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0) 100%)',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pop: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 2.2s linear infinite',
        pop: 'pop 0.25s ease-out',
        'slide-up': 'slideUp 0.35s ease-out',
      },
    },
  },
  plugins: [],
};
