import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#05060A",
          900: "#0A0C14",
          800: "#0F1320",
          700: "#161B2E",
          600: "#1E243C"
        },
        neon: {
          cyan: "#5EEAD4",
          magenta: "#F472B6",
          violet: "#A78BFA",
          amber: "#FBBF24"
        },
        line: "rgba(255,255,255,0.08)"
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"]
      },
      boxShadow: {
        glow: "0 0 80px -20px rgba(94,234,212,0.45)",
        card: "0 30px 80px -30px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)"
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(ellipse at top, rgba(94,234,212,0.10), transparent 55%), radial-gradient(ellipse at bottom, rgba(167,139,250,0.08), transparent 60%)",
        "noise":
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.5'/></svg>\")"
      },
      keyframes: {
        pulseGlow: {
          "0%,100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.06)" }
        },
        floatY: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
        ticker: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" }
        },
        rise: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        pulseGlow: "pulseGlow 3.2s ease-in-out infinite",
        floatY: "floatY 6s ease-in-out infinite",
        shimmer: "shimmer 6s linear infinite",
        ticker: "ticker 40s linear infinite",
        rise: "rise 0.6s ease-out forwards"
      }
    }
  },
  plugins: []
};

export default config;
