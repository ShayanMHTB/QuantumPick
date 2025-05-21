"use client";

import i18next from "i18next";
import { initReactI18next, useTranslation as useTranslationOrg } from "react-i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { getOptions } from "./settings";

// Initialize i18next
i18next
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(
    resourcesToBackend(
      (language: string, namespace: string) =>
        import(`./translations/${language}/${namespace}.json`)
    )
  )
  .init({
    ...getOptions(),
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

export function useTranslation(namespace: string) {
  const { t, i18n } = useTranslationOrg(namespace);
  return { t, i18n };
}
