module.exports = {
  theme: {
    extend: {
      gridTemplateColumns: {
        // Dream page layout
        sidebar: "1fr 300px"
      },
      height: {
        "88": "22rem"
      }
    },
    animations: {
      spin: {
        from: {
          transform: "rotate(0deg)"
        },
        to: {
          transform: "rotate(360deg)"
        }
      }
    }
  },
  variants: {
    backgroundColor: ["responsive", "hover", "focus", "even"],
    textColor: ["responsive", "hover", "focus", "group-hover", "last"]
  },
  plugins: [require("tailwindcss-animations")]
};
