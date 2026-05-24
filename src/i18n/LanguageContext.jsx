import React, { createContext, useContext, useState, useEffect } from 'react';
import { translate } from './translations';

const LanguageContext = createContext();

const STORAGE_KEY = 'agriphix_lang';

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY) || 'en';
    }
    return 'en';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang === 'lg' ? 'lg' : 'en';
  }, [lang]);

  const setLang = (next) => setLangState(next === 'lg' ? 'lg' : 'en');
  const toggleLang = () => setLangState((prev) => (prev === 'en' ? 'lg' : 'en'));
  const t = (key) => translate(lang, key);

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within LanguageProvider');
  }
  return context;
}
