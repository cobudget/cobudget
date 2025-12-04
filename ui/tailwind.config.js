const defaultTheme = require("tailwindcss/defaultTheme");
const { colors, tailwindHsl } = require("./utils/colors");

const classes = [
  ...colors.map((c) => `bg-${c}`),
  ...colors.map((c) => `bg-${c}-100`),
  ...colors.map((c) => `bg-${c}-200`),
  ...colors.map((c) => `bg-${c}-dark`),
  ...colors.map((c) => `text-${c}`),
  ...colors.map((c) => `text-${c}-dark`),
  ...colors.map((c) => `border-${c}`),
  ...colors.map((c) => `ring-${c}-dark`),
];

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./utils/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    ...classes,
    ...classes.map((c) => `hover:${c}`),
    ...classes.map((c) => `group-hover:${c}`),
    ...classes.map((c) => `focus:${c}`),
    ...classes.map((c) => `focus-within:${c}`),
  ],
  theme: {
    extend: {
      gridTemplateColumns: {
        // Bucket page layout
        sidebar: "minmax(0,1fr) 350px",
        funding: "auto minmax(100px, max-content)",
        groupheading: "8rem calc(100% - 16rem)",
      },
      borderColor: {
        f: "rgb(172, 182, 192)",
      },
      fontSize: {
        xxs: "9px",
      },
      backgroundColor: {
        highlight: "#fce9b4",
        "app-gray": "#4d4d4d",
        "app-yellow": "#f6c429",
        "app-orange": "#ff9301",
        "app-purple": "#80529b",
        "app-green": "#87c44a",
        "app-light-green": "#90ba80",
        "app-red": "#ff5455",
      },
      height: {
        88: "22rem",
        100: "25rem",
        148: "37rem",
      },
      width: {
        100: "25rem",
      },
      fontFamily: {
        sans: ["Inter var", "Inter", ...defaultTheme.fontFamily.sans],
      },
      maxWidth: {
        "screen-2lg": "1140px",
      },
      colors: tailwindHsl,
      spacing: {
        7: "1.75rem",
      },
      keyframes: {
        wiggle: {
          "0%, 50%, 59%, 100%": { transform: "rotate(0deg)" },
          "53%": { transform: "rotate(3deg)" },
          "56%": { transform: "rotate(-3deg)" },
        },
        "mega-wiggle": {
          "0%, 100%": { transform: "rotate(0deg)" },
          "33%": { transform: "rotate(3deg)" },
          "66%": { transform: "rotate(-3deg)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        spin: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        wiggle: "wiggle 2.5s ease-in-out infinite",
        "mega-wiggle": "mega-wiggle 0.2s ease-in-out infinite",
        "fade-in": "fade-in 0.3s ease-in-out",
      },
      borderWidth: {
        DEFAULT: "1px",
        0: "0",
        2: "2px",
        3: "3px",
        4: "4px",
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      addUtilities({
        '.break-inside-avoid': {
          'break-inside': 'avoid',
        },
      });
    },
  ],
};
