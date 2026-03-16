import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Shadcn design tokens (CSS variables defined in globals.css @layer base)
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: { DEFAULT: 'var(--primary)', foreground: 'var(--primary-foreground)' },
        secondary: { DEFAULT: 'var(--secondary)', foreground: 'var(--secondary-foreground)' },
        destructive: { DEFAULT: 'var(--destructive)', foreground: 'var(--destructive-foreground)' },
        muted: { DEFAULT: 'var(--muted)', foreground: 'var(--muted-foreground)' },
        accent: { DEFAULT: 'var(--accent)', foreground: 'var(--accent-foreground)' },
        popover: { DEFAULT: 'var(--popover)', foreground: 'var(--popover-foreground)' },
        card: { DEFAULT: 'var(--card)', foreground: 'var(--card-foreground)' },
        sidebar: {
          DEFAULT: 'var(--sidebar)',
          foreground: 'var(--sidebar-foreground)',
          primary: 'var(--sidebar-primary)',
          'primary-foreground': 'var(--sidebar-primary-foreground)',
          accent: 'var(--sidebar-accent)',
          'accent-foreground': 'var(--sidebar-accent-foreground)',
          border: 'var(--sidebar-border)',
          ring: 'var(--sidebar-ring)',
        },
        // FF7R custom tokens (CSS variables in globals.css :root)
        mt: 'var(--mt)',
        mtd: 'var(--mtd)',
        dg: 'var(--dg)',
        dgd: 'var(--dgd)',
        void: 'var(--void)',
        sf: 'var(--sf)',
        sfm: 'var(--sfm)',
        sfh: 'var(--sfh)',
        w: 'var(--w)',
        wd: 'var(--wd)',
        wm: 'var(--wm)',
        mg: 'var(--mg)',
        my: 'var(--my)',
        mb: 'var(--mb)',
        mp: 'var(--mp)',
        mr: 'var(--mr)',
        mo: 'var(--mo)',
        cgr: 'var(--cgr)',
        cpr: 'var(--cpr)',
      },
      fontFamily: {
        header: ['Optima', 'Palatino Linotype', 'serif'],
        body: ['Segoe UI', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Courier New', 'monospace'],
      },
      borderRadius: {
        sm: 'var(--r)',
        DEFAULT: 'var(--rl)',
      },
      boxShadow: {
        teal: 'var(--gt)',
        green: 'var(--gg)',
      },
    },
  },
  plugins: [],
};

export default config;
