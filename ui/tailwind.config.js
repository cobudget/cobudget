const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  theme: {
    extend: {
      gridTemplateColumns: {
        // Dream page layout
        sidebar: "1fr 300px",
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
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
      },
      maxWidth: {
        "screen-2lg": "1140px",
      },
      colors: {
        red: {
          100: "hsl(351, 80%, 96%)",
          200: "hsl(351, 80%, 93%)",
          500: "hsl(351, 80%, 69%)",
          900: "hsl(351, 80%, 14%)",
          default: "hsl(351, 80%, 60%)",
          darker: "hsl(351, 80%, 55%)",
        },
        lavendel: {
          100: "hsl(257, 70%, 96%)",
          200: "hsl(257, 70%, 93%)",
          default: "hsl(257, 70%, 59%)",
          darker: "hsl(257, 70%, 54%)",
        },
        blue: {
          100: "hsl(224,79%, 96%)",
          200: "hsl(224,79%, 93%)",
          300: "hsl(224,79%, 88%)",
          default: "hsl(224, 79%, 53%)",
          darker: "hsl(224, 79%, 48%)",
        },
        orange: {
          100: "hsl(20, 87%, 96%)",
          200: "hsl(20, 87%, 93%)",
          default: "hsl(20, 87%, 59%)",
          darker: "hsl(20, 87%, 54%)",
        },
        purple: {
          100: "hsl(284, 60%, 96%)",
          200: "hsl(284, 60%, 93%)",
          default: "hsl(284, 60%, 57%)",
          darker: "hsl(284, 60%, 52%)",
        },
        green: {
          100: "hsl(143, 62%, 96%)",
          200: "hsl(143, 62%, 93%)",
          500: "hsl(143, 62%, 69%)",
          900: "hsl(143, 62%, 14%)",
          default: "hsl(143, 62%, 45%)",
          darker: "hsl(143, 62%, 40%)",
        },
        yellow: {
          100: "hsl(49, 91%, 96%)",
          200: "hsl(49, 91%, 93%)",
          500: "hsl(143, 62%, 69%)",
          900: "hsl(143, 62%, 14%)",
          default: "hsl(49, 91%, 48%)",
          darker: "hsl(49, 91%, 43%)",
        },
        pink: {
          100: "hsl(317, 66%, 96%)",
          200: "hsl(317, 66%, 93%)",
          default: "hsl(317, 66%, 65%)",
          darker: "hsl(317, 66%, 60%)",
        },
        aqua: {
          100: "hsl(195, 85%, 96%)",
          200: "hsl(195, 85%, 93%)",
          default: "hsl(195, 85%, 49%)",
          darker: "hsl(195, 85%, 44%)",
        },
        anthracit: {
          100: "hsl(223, 3%, 96%)",
          200: "hsl(223, 3%, 93%)",
          default: "hsl(223, 3%, 15%)",
          darker: "hsl(223, 3%, 10%)",
        },
      },
      shadowOutline: {
        shadow: "0 0 0 3px",
        alpha: "1",
      },
      spacing: {
        7: "1.75rem",
      },
      keyframes: {
        wiggle: {
          "0%, 91%, 100%": { transform: "rotate(0deg)" },
          "94%": { transform: "rotate(3deg)" },
          "97%": { transform: "rotate(-3deg)" },
        },
      },
      animation: {
        wiggle: "wiggle 2.5s ease-in-out infinite",
      },
    },
    borderWidth: {
      default: "1px",
      0: "0",
      2: "2px",
      3: "3px",
      4: "4px",
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
    animation: ["responsive", "hover"],
    // borderStyle: ["hover", "focus"],
  },
  plugins: [
    require("tailwindcss-animations"),
    require("tailwindcss-font-inter")(),
    require("tailwindcss-shadow-outline-colors")(),
    require("@neojp/tailwindcss-line-clamp-utilities"),
  ],
};
