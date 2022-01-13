import { colors } from "./colors";

export const stringToColor = (str) => {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  var h = Math.abs(hash % colors.length);

  return colors[h];
};
