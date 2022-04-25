export default function isRTL (lang: string) {
    const rtls = ["ur"];
    return rtls.indexOf(lang) > -1;
}