/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1a472a", // Deep Herbal Green
          dark: "#0d2b18",
          light: "#2d6a45",
          glass: "rgba(26, 71, 42, 0.1)",
        },
        secondary: {
          DEFAULT: "#ecfdf5", // Soft Mint
          dark: "#a7f3d0",
          accent: "#059669",
        },
        accent: {
          DEFAULT: "#f7f3e8", // Warm Beige
          dark: "#e6e0d0",
          gold: "#d4af37",
          bronze: "#cd7f32",
        },
        gold: {
          light: "#f3e5ab",
          DEFAULT: "#d4af37",
          dark: "#aa8c2c",
        }
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'blob-spin': 'blob-spin 20s infinite linear',
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
      },
      keyframes: {
        'blob-spin': {
          '0%': { transform: 'rotate(0deg) scale(1)' },
          '33%': { transform: 'rotate(120deg) scale(1.1)' },
          '66%': { transform: 'rotate(240deg) scale(0.9)' },
          '100%': { transform: 'rotate(360deg) scale(1)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
