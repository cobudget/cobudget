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
      colors: {
        green: "#2cbc63",
        red: "#eb4962",
      },
    },
    borderWidth: {
      default: "1px",
      "0": "0",
      "2": "2px",
      "3": "3px",
      "4": "4px",
    },
    animations: {
      "fade-in": {
        from: {
          opacity: 0,
        },
      },
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
