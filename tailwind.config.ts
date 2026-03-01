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
        glow: "0 24px 80px -36px rgba(16, 42, 69, 0.42), 0 10px 32px -18px rgba(140, 107, 50, 0.42)",
      },
      backgroundImage: {
        "radial-soft":
          "radial-gradient(circle at top, rgba(16, 42, 69, 0.22), transparent 38%), radial-gradient(circle at bottom right, rgba(140, 107, 50, 0.3), transparent 28%)",
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
