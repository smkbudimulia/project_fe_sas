import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily:{
        lato: ["Lato", "sans-serif"],
      },
      colors:{
        white: "#fff",
        black: "#313131",
        yellow: "#fdd201"
      },
      backgroundImage: {
        pageBg: "url('/image')"
      },
    },
  },
  plugins: [],
};
export default config;
