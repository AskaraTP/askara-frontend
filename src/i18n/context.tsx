'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Locale } from '@/types';
import en from './en.json';
import id from './id.json';

const dictionaries = { en, id };

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: typeof en;
  getLocalizedText: (enText: string | null | undefined, idText: string | null | undefined) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    const saved = localStorage.getItem('askara_locale') as Locale | null;
    if (saved === 'en' || saved === 'id') {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('askara_locale', newLocale);
  };

  const getLocalizedText = (enText: string | null | undefined, idText: string | null | undefined): string => {
    if (locale === 'id') {
      return idText || enText || '';
    }
    return enText || idText || '';
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t: dictionaries[locale], getLocalizedText }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
