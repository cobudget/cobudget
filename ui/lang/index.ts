import en from "./en.json";
import sv from "./sv-SE.json";
import ur from "./ur-PK.json";
import he from "./he-IL.json";
import de from "./de-DE.json";

const langs = {
  en,
  sv,
  ur,
  he,
  de,
};

export const supportedLangCodes = Object.keys(langs);
export const supportedLangs = [
  { value: "en", label: "English" },
  { value: "sv", label: "Swedish" },
  { value: "he", label: "Hebrew" },
  { value: "de", label: "German" },
];

export default langs;
