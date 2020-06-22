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
      maxWidth: {
        "screen-2lg": "1140px",
      },
      colors: {
        red: { default: "hsl(351, 80%, 60%)", darker: "hsl(351, 80%, 55%)" },
        lavendel: {
          default: "hsl(257, 70%, 59%)",
          darker: "hsl(257, 70%, 54%)",
        },
        blue: { default: "hsl(224, 79%, 53%)", darker: "hsl(224, 79%, 48%)" },
        orange: { default: "hsl(20, 87%, 59%)", darker: "hsl(20, 87%, 54%)" },
        purple: {
          default: "hsl(284, 60%, 57%)",
          darker: "hsl(284, 60%, 52%)",
        },
        green: { default: "hsl(143, 62%, 45%)", darker: "hsl(143, 62%, 40%)" },
        yellow: { default: "hsl(49, 91%, 48%)", darker: "hsl(49, 91%, 43%)" },
        pink: { default: "hsl(317, 66%, 65%)", darker: "hsl(317, 66%, 60%)" },
        aqua: { default: "hsl(195, 85%, 49%)", darker: "hsl(195, 85%, 44%)" },
        anthracit: {
          default: "hsl(223, 3%, 15%)",
          darker: "hsl(223, 3%, 10%)",
        },
      },
      shadowOutline: {
        shadow: "0 0 0 3px",
        alpha: "1",
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
    shadowOutline: ["focus", "hover"],
    visibility: ["responsive", "group-hover"],
    // borderStyle: ["hover", "focus"],
  },
  plugins: [
    require("tailwindcss-animations"),
    require("tailwindcss-font-inter")(),
    require("tailwindcss-shadow-outline-colors")(),
  ],
};
