import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        border: "hsl(var(--border))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        highlight: "hsl(var(--highlight))",
        "highlight-foreground": "hsl(var(--highlight-foreground))",
        ochre: "hsl(var(--ochre))",
        destructive: "hsl(var(--destructive))",
        success: "hsl(var(--success))",
      },
      boxShadow: {
        glow: "0 26px 78px -38px rgba(11, 31, 53, 0.6), 0 12px 36px -24px rgba(142, 107, 48, 0.42)",
      },
      backgroundImage: {
        "radial-soft":
          "radial-gradient(circle at top, rgba(9, 38, 70, 0.2), transparent 38%), radial-gradient(circle at bottom right, rgba(164, 128, 66, 0.28), transparent 34%)",
      },
      fontFamily: {
        body: ["var(--font-body)"],
        display: ["var(--font-body)"],
      },
    },
  },
  plugins: [],
};

export default config;
