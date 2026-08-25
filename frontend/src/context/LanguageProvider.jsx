import { createContext, useContext, useMemo, useState } from "react";
import { en, te } from "../i18n/translations.js";
import { STORAGE_KEYS, readJson, writeJson } from "../utils/storage.js";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => readJson(STORAGE_KEYS.language, "en"));

  const setLanguage = (next) => {
    setLanguageState(next);
    writeJson(STORAGE_KEYS.language, next);
  };

  const value = useMemo(() => {
    const dict = language === "te" ? te : en;
    return {
      language,
      setLanguage,
      t: (key) => dict[key] || en[key] || key,
      aiLanguage: language === "te" ? "Telugu" : "English",
    };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
