'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SupportedLanguage } from '@/lib/types';
import { translations, TranslationDictionary } from '@/lib/i18n/translations';
import { useAuth } from './AuthContext';

interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: TranslationDictionary;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, setUser } = useAuth();
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('civora_preferred_language') as SupportedLanguage | null;
        if (stored && (stored === 'en' || stored === 'am' || stored === 'om')) {
          return stored;
        }
      } catch {
        // Ignore
      }
    }
    return 'en';
  });

  // If user profile has an explicit language preference, respect it; otherwise use stored/selected
  const currentLanguage: SupportedLanguage = user?.preferredLanguage || selectedLanguage;

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    setSelectedLanguage(lang);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('civora_preferred_language', lang);
      } catch {
        // Ignore
      }
    }

    // Persist to user profile state and backend
    if (user) {
      setUser({ ...user, preferredLanguage: lang });
      // Asynchronously update profile in backend
      fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, preferredLanguage: lang }),
      }).catch(() => {
        // Silently tolerate demo mode fallback
      });
    }
  }, [user, setUser]);

  const t = translations[currentLanguage] || translations.en;

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
