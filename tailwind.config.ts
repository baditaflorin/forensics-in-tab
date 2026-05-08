import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#101828',
        slatewash: '#eff3f7',
        signal: '#1e7a78',
        amberline: '#b7791f',
        evidence: '#6f3f8d'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'SFMono-Regular', 'Consolas', 'monospace']
      },
      boxShadow: {
        panel: '0 18px 45px rgba(16, 24, 40, 0.11)'
      }
    }
  },
  plugins: []
} satisfies Config;
