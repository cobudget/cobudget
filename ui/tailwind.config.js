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
        // Since we override colors we need to manually add wanted colors to use bg-red-300 for example
        // To add colors copy them from here - https://github.com/tailwindlabs/tailwindcss/blob/master/stubs/defaultConfig.stub.jsv
        red: {
          default: "hsl(351, 80%, 60%)",
          darker: "hsl(351, 80%, 55%)",
          100: '#fff5f5',
          200: '#fed7d7',
          300: '#feb2b2',
          400: '#fc8181',
          500: '#f56565',
          600: '#e53e3e',
          700: '#c53030',
          800: '#9b2c2c',
          900: '#742a2a'
        },
        lavendel: {
          default: "hsl(257, 70%, 59%)",
          darker: "hsl(257, 70%, 54%)",
        },
        blue: { default: "hsl(224, 79%, 53%)", darker: "hsl(224, 79%, 48%)" },
        orange: {
          default: "hsl(20, 87%, 59%)",
          darker: "hsl(20, 87%, 54%)",
          100: '#fffaf0',
          200: '#feebc8',
          300: '#fbd38d',
          400: '#f6ad55',
          500: '#ed8936',
          600: '#dd6b20',
          700: '#c05621',
          800: '#9c4221',
          900: '#7b341e',
        },
        purple: {
          default: "hsl(284, 60%, 57%)",
          darker: "hsl(284, 60%, 52%)",
        },
        green: {
          default: "hsl(143, 62%, 45%)",
          darker: "hsl(143, 62%, 40%)",
          100: '#f0fff4',
          200: '#c6f6d5',
          300: '#9ae6b4',
          400: '#68d391',
          500: '#48bb78',
          600: '#38a169',
          700: '#2f855a',
          800: '#276749',
          900: '#22543d',
        },
        yellow: {
          default: "hsl(49, 91%, 48%)",
          darker: "hsl(49, 91%, 43%)",
          100: '#fffff0',
          200: '#fefcbf',
          300: '#faf089',
          400: '#f6e05e',
          500: '#ecc94b',
          600: '#d69e2e',
          700: '#b7791f',
          800: '#975a16',
          900: '#744210',
        },
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
      spacing: {
        "7": "1.75rem",
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
    require("@neojp/tailwindcss-line-clamp-utilities"),
  ],
};
