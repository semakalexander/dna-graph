import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
      colors: {
        shark: "#1e1e24",
      },
      spacing: {
        leftSidebarWidth: "15rem",
        rightSidebarWidth: "15rem",
        bottomPanelHeight: "50vh",
      },
    },
  },
  plugins: [],
} satisfies Config;
