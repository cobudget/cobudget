const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  theme: {
    extend: {
      gridTemplateColumns: {
        // Dream page layout
        sidebar: "1fr 300px",
      },
      height: {
        "88": "22rem",
      },
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
      },
    },
    animations: {
      spin: {
        from: {
          transform: "rotate(0deg)",
        },
        to: {
          transform: "rotate(360deg)",
        },
      },
    },
  },
  variants: {
    backgroundColor: ["responsive", "hover", "focus", "even"],
    textColor: ["responsive", "hover", "focus", "group-hover", "last"],
  },
  plugins: [
    require("tailwindcss-animations"),
    require("tailwindcss-font-inter")(),
  ],
};
