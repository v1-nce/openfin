import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#f6f0e6",
        ink: "#10222d",
        sand: "#e7d7bf",
        coral: "#e57a5f",
        moss: "#6d8c65",
        ocean: "#1e6f83",
        slate: "#465865"
      },
      boxShadow: {
        panel: "0 24px 80px rgba(16, 34, 45, 0.12)"
      },
      borderRadius: {
        xl2: "1.5rem"
      },
      backgroundImage: {
        grain:
          "radial-gradient(circle at 20% 20%, rgba(229, 122, 95, 0.18), transparent 35%), radial-gradient(circle at 80% 10%, rgba(30, 111, 131, 0.18), transparent 30%), linear-gradient(135deg, rgba(255,255,255,0.95), rgba(246, 240, 230, 0.96))"
      }
    }
  },
  plugins: []
};

export default config;
