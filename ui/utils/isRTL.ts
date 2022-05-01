export default function isRTL (lang: string) {
    const rtls = ["ur", "ar"];
    return rtls.indexOf(lang) > -1;
}