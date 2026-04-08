/** @type {import('tailwindcss').Config} */
// All token values sourced from Stitch design:
// https://stitch.withgoogle.com/projects/2770586918123854384
// Design system: "Ethereal Bond" — Primary #C0556A, Secondary #7F77DD

module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Brand — from Stitch "Ethereal Bond" palette
        primary:   '#C0556A', // Deep rose — CTA buttons, active states
        secondary: '#7F77DD', // Warm purple — secondary accents, Perception phase
        teal:      '#1D9E75', // Action phase, success, Mutual badge
        amber:     '#EF9F27', // Will phase, warnings, Watch badge
        danger:    '#E24B4A', // Errors, One-sided badge

        // Surfaces
        background: '#FAF9F6', // App canvas
        card:       '#FFFFFF', // Card surfaces, modals

        // Text
        foreground: '#1A1A1A', // Primary body text
        muted:      '#888780', // Subtitles, captions
        hint:       '#B4B2A9', // Disabled / placeholder

        // Borders
        border: '#E8E6E0', // Card edges, dividers, input outlines

        // Tints (for colored card backgrounds)
        'rose-tint':   '#FDE8EC',
        'purple-tint': '#EEEDFE',
        'teal-tint':   '#E1F5EE',
        'amber-tint':  '#FAEEDA',
        'red-tint':    '#FCEBEB',

        // Splash gradient (S01 — extracted from Stitch screenshot)
        'splash-top':    '#FAE4EA',
        'splash-bottom': '#FAF9F6',

        // Dark title color (S01 brand text)
        'brand-dark': '#2D0B1F',
      },

      fontFamily: {
        // Extracted from Stitch design system panel
        heading: ['PlusJakartaSans-Bold', 'Plus Jakarta Sans', 'sans-serif'],
        'heading-regular': ['PlusJakartaSans-Regular', 'Plus Jakarta Sans', 'sans-serif'],
        body:    ['BeVietnamPro-Regular', 'Be Vietnam Pro', 'sans-serif'],
        'body-medium': ['BeVietnamPro-Medium', 'Be Vietnam Pro', 'sans-serif'],
      },

      borderRadius: {
        // Extracted from Stitch card and button styles
        card:     '16px',
        'card-lg': '20px',
        button:   '50px',  // Pill shape
        input:    '12px',
        pill:     '20px',  // Author pills, badges
        badge:    '4px',
      },

      spacing: {
        'screen-x': '20px',  // Screen horizontal padding
        'card-p':   '16px',  // Card internal padding
        'section':  '16px',  // Between major sections
        'component': '12px', // Between related components
        'tight':    '8px',   // Between closely related items
      },

      fontSize: {
        'hero':   ['48px', { lineHeight: '1.0', fontWeight: '700' }],
        'large-num': ['40px', { lineHeight: '1.1', fontWeight: '700' }],
        'h1':     ['24px', { lineHeight: '1.3', fontWeight: '700' }],
        'h2':     ['20px', { lineHeight: '1.3', fontWeight: '600' }],
        'h3':     ['16px', { lineHeight: '1.4', fontWeight: '600' }],
        'body':   ['14px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-md': ['14px', { lineHeight: '1.6', fontWeight: '500' }],
        'caption': ['12px', { lineHeight: '1.5', fontWeight: '400' }],
        'micro':  ['11px', { lineHeight: '1.4', fontWeight: '500' }],
      },

      boxShadow: {
        // Card shadow — sourced from Stitch shadow values
        'card': '0px 2px 12px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
};
