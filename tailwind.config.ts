import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'neon-cyan':    '#00e5ff',
        'neon-green':   '#39ff14',
        'neon-purple':  '#bf5af2',
        'neon-orange':  '#ff6b35',
        'neon-red':     '#ff2d55',
        'neon-gold':    '#ffd700',
        'dark-900':     '#020509',
        'dark-800':     '#040810',
        'dark-700':     '#080f1a',
        'dark-600':     '#0d1624',
        'dark-500':     '#112030',
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        mono:     ['JetBrains Mono', 'monospace'],
        body:     ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-neon':  'pulseNeon 2.5s ease-in-out infinite',
        'float':       'float 4s ease-in-out infinite',
        'scan':        'scan 3s linear infinite',
        'glitch':      'glitch 0.4s steps(2, jump-none) infinite',
        'spin-slow':   'spin 8s linear infinite',
        'border-flow': 'borderFlow 3s linear infinite',
      },
      keyframes: {
        pulseNeon: {
          '0%,100%': { opacity: '0.7', filter: 'brightness(1)' },
          '50%': { opacity: '1', filter: 'brightness(1.3)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)', opacity: '0.6' },
          '100%': { transform: 'translateY(100vh)', opacity: '0' },
        },
        glitch: {
          '0%': { clipPath: 'inset(0 0 80% 0)', transform: 'translate(-2px,0)' },
          '25%': { clipPath: 'inset(40% 0 20% 0)', transform: 'translate(2px,0)' },
          '50%': { clipPath: 'inset(20% 0 60% 0)', transform: 'translate(-1px,0)' },
          '75%': { clipPath: 'inset(60% 0 0% 0)', transform: 'translate(1px,0)' },
          '100%': { clipPath: 'inset(80% 0 0 0)', transform: 'translate(0,0)' },
        },
        borderFlow: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
      },
      boxShadow: {
        'neon-sm':   '0 0 8px rgba(0,229,255,0.4)',
        'neon-md':   '0 0 20px rgba(0,229,255,0.4)',
        'neon-lg':   '0 0 40px rgba(0,229,255,0.3)',
        'neon-xl':   '0 0 60px rgba(0,229,255,0.2)',
        'green-sm':  '0 0 8px rgba(57,255,20,0.4)',
        'green-md':  '0 0 20px rgba(57,255,20,0.35)',
        'purple-md': '0 0 20px rgba(191,90,242,0.4)',
        'orange-md': '0 0 20px rgba(255,107,53,0.4)',
        'gold-md':   '0 0 20px rgba(255,215,0,0.4)',
        'inset-neon':'inset 0 0 30px rgba(0,229,255,0.05)',
      },
      backdropBlur: { xs: '2px' },
      backgroundImage: {
        'grid-dark':    'linear-gradient(rgba(0,229,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.04) 1px, transparent 1px)',
        'grid-fine':    'linear-gradient(rgba(0,229,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.025) 1px, transparent 1px)',
        'circuit-trace':'linear-gradient(90deg, transparent 30%, rgba(0,229,255,0.15) 50%, transparent 70%)',
      },
      backgroundSize: {
        'grid-48': '48px 48px',
        'grid-16': '16px 16px',
      },
    },
  },
  plugins: [],
};

export default config;
