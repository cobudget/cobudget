import en from "./en.json";
import sv from "./sv-SE.json";
import ur from "./ur-PK.json";

const langs = {
    en,
    sv,
    ur,
}

export const supportedLangCodes = Object.keys(langs);
export const supportedLangs = [
    { value: "en", label: "English"},
    { value: "sv", label: "Swedish"},
    { value: "ur", label: "Urdu" },
];

export default langs;