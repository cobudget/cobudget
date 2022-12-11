import en from "./en.json";
import sv from "./sv-SE.json";
import ur from "./ur-PK.json";
import he from "./he-IL.json";

const langs = {
  en,
  sv,
  ur,
  he,
};

export const supportedLangCodes = Object.keys(langs);
export const supportedLangs = [
  { value: "en", label: "English" },
  { value: "sv", label: "Swedish" },
  { value: "ur", label: "Urdu" },
  { value: "he", label: "Hebrew" },
];

export default langs;
