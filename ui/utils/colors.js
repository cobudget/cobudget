module.exports.colors = [
  "anthracit",
  "blue",
  "lavendel",
  "purple",
  "pink",
  "red",
  "orange",
  "yellow",
  "green",
  "aqua",
];

const hslColorValues = {
  red: {
    100: "351, 80%, 96%",
    200: "351, 80%, 93%",
    500: "351, 80%, 69%",
    900: "351, 80%, 14%",
    DEFAULT: "351, 80%, 60%",
    dark: "351, 80%, 55%",
  },
  lavendel: {
    100: "257, 70%, 96%",
    200: "257, 70%, 93%",
    DEFAULT: "257, 70%, 59%",
    dark: "257, 70%, 54%",
  },
  blue: {
    100: "224,79%, 96%",
    200: "224,79%, 93%",
    300: "224,79%, 88%",
    DEFAULT: "224, 79%, 53%",
    dark: "224, 79%, 48%",
  },
  orange: {
    100: "20, 87%, 96%",
    200: "20, 87%, 93%",
    DEFAULT: "20, 87%, 59%",
    dark: "20, 87%, 54%",
  },
  purple: {
    100: "284, 60%, 96%",
    200: "284, 60%, 93%",
    DEFAULT: "284, 60%, 57%",
    dark: "284, 60%, 52%",
  },
  green: {
    100: "143, 62%, 96%",
    200: "143, 62%, 93%",
    500: "143, 62%, 69%",
    900: "143, 62%, 14%",
    DEFAULT: "143, 62%, 45%",
    dark: "143, 62%, 40%",
  },
  yellow: {
    100: "49, 91%, 96%",
    200: "49, 91%, 93%",
    500: "49, 91%, 69%",
    900: "49, 91%, 14%",
    DEFAULT: "49, 91%, 48%",
    dark: "49, 91%, 43%",
  },
  pink: {
    100: "317, 66%, 96%",
    200: "317, 66%, 93%",
    DEFAULT: "317, 66%, 65%",
    dark: "317, 66%, 60%",
  },
  aqua: {
    100: "195, 85%, 96%",
    200: "195, 85%, 93%",
    DEFAULT: "195, 85%, 49%",
    dark: "195, 85%, 44%",
  },
  anthracit: {
    100: "223, 3%, 96%",
    200: "223, 3%, 93%",
    DEFAULT: "223, 3%, 15%",
    dark: "223, 3%, 5%",
  },
};

module.exports.tailwindHsl = {};

for (let [colorName, colorVariants] of Object.entries(hslColorValues)) {
  module.exports.tailwindHsl[colorName] = {};
  for (let [variantName, variantValue] of Object.entries(colorVariants)) {
    module.exports.tailwindHsl[colorName][variantName] = `hsl(${variantValue})`;
  }
}

module.exports.namedColorWithAlpha = (colorName, alpha) => {
  return `hsla(${hslColorValues[colorName].DEFAULT}, ${alpha})`;
};
