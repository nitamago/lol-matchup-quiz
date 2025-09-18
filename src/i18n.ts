import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import cn from "./locales/cn/translation.json";
import en from "./locales/en/translation.json";
import ja from "./locales/ja/translation.json";
import kr from "./locales/kr/translation.json";

i18n
  .use(LanguageDetector) // 自動検出
  .use(initReactI18next)
  .init({
    resources: {
      // cn: { translation: cn },
      en: { translation: en },
      ja: { translation: ja },
      // kr: { translation: kr }
    },
    fallbackLng: "en", // ブラウザ言語に対応がなければ英語
    interpolation: { escapeValue: false },
    detection: {
      // デフォルトの検出順
      order: ["querystring", "localStorage", "navigator"],
      caches: ["localStorage"], // 言語を記憶
    },
  });

export default i18n;
