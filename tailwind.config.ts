import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "rgb(var(--border))", // supaya utility border-border valid
      },
      borderRadius: {
        "2xl": "1rem",
      },
      fontFamily: {
        sans: ["Inter", "Jakarta Sans", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
