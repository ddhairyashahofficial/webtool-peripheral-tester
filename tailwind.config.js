/** @type {import('tailwindcss').Config} */

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],

  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"]
      },

      animation: {
        spring: "spring .45s cubic-bezier(.175,.885,.32,1.275)",
        shimmer: "shimmer 4s cubic-bezier(.4,0,.2,1) infinite",
        float: "float 18s ease-in-out infinite"
      },

      keyframes: {
        spring: {
          "0%": {
            opacity: "0",
            transform: "scale(.96)"
          },
          "100%": {
            opacity: "1",
            transform: "scale(1)"
          }
        },

        shimmer: {
          "0%": {
            transform: "translateX(-150%) skewX(-15deg)"
          },
          "100%": {
            transform: "translateX(250%) skewX(-15deg)"
          }
        },

        float: {
          "0%,100%": {
            transform: "translateY(0px)"
          },
          "50%": {
            transform: "translateY(-18px)"
          }
        }
      }
    }
  },

  plugins: []
};