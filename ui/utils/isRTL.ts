export default function isRTL(lang: string) {
  const rtls = ["ur", "ar", "he"];
  return rtls.indexOf(lang) > -1;
}
