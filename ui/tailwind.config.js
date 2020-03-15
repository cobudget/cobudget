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
    }
  },
  variants: {
    backgroundColor: ["responsive", "hover", "focus", "even"],
    textColor: ["responsive", "hover", "focus", "group-hover"]
  },
  plugins: []
};
