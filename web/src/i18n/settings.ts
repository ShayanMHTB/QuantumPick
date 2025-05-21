export const fallbackLng = "en";
export const languages = ["en", "de", "es", "fr", "it", "ru", "fa"];
export const defaultNS = "common";

export function getOptions(lng = fallbackLng, ns = defaultNS) {
  return {
    debug: process.env.NODE_ENV === "development",
    supportedLngs: languages,
    fallbackLng,
    lng,
    fallbackNS: defaultNS,
    defaultNS,
    ns,
  };
}
