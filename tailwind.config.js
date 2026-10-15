/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0b0c0f',
        panel: '#101218',
        panel2: '#151822',
        line: 'rgba(232,181,74,0.16)',
        linedim: 'rgba(230,225,213,0.09)',
        ink: '#e6e1d5',
        dim: '#8f8a7d',
        faint: '#5b574d',
        amber: {
          DEFAULT: '#e8b54a',
          bright: '#f5cd7a',
          deep: '#a97e2a',
        },
        ok: '#7fd6a4',
      },
      fontFamily: {
        // Terminal identity: mono leads, CJK falls through to system CJK stacks.
        mono: [
          '"JetBrains Mono"',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Consolas',
          '"PingFang SC"',
          '"Microsoft YaHei"',
          '"Noto Sans CJK SC"',
          'monospace',
        ],
      },
      letterSpacing: {
        tighter2: '-0.03em',
      },
    },
  },
  plugins: [],
}
