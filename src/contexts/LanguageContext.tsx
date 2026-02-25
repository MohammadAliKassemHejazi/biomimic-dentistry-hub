import React, { createContext, useContext, useEffect, useState } from 'react';

export type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'pt' | 'it' | 'zh' | 'ja' | 'ko' | 'ar';

interface Language {
  code: LanguageCode;
  name: string;
  flag: string;
}

export const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' }
];

const translations: Record<LanguageCode, Record<string, any>> = {
  en: {
    nav: {
      home: 'Home',
      learn: 'Learn',
      community: 'Community',
      courses: 'Courses',
      resources: 'Resources',
      blog: 'Blog',
      about: 'About',
      ambassadors: 'Ambassadors',
      contact: 'Contact',
      account: 'Account',
      dashboard: 'Dashboard',
      subscription: 'Subscription',
      admin: 'Admin',
      login: 'Login',
      signup: 'Sign Up',
      logout: 'Logout',
      changeLanguage: 'Change language'
    },
    hero: {
      title1: 'Making Dentistry More',
      human: 'Human',
      and: 'and',
      accessible: 'Accessible',
      subtitle: 'Join the movement redefining dental care through biomimetic science, connecting students worldwide with affordable, accessible education.'
    }
  },
  es: {
    nav: {
      home: 'Inicio',
      learn: 'Aprender',
      community: 'Comunidad',
      courses: 'Cursos',
      resources: 'Recursos',
      blog: 'Blog',
      about: 'Acerca de',
      ambassadors: 'Embajadores',
      contact: 'Contacto',
      account: 'Cuenta',
      dashboard: 'Tablero',
      subscription: 'Suscripción',
      admin: 'Administración',
      login: 'Iniciar sesión',
      signup: 'Registrarse',
      logout: 'Cerrar sesión',
      changeLanguage: 'Cambiar idioma'
    },
    hero: {
      title1: 'Haciendo la odontología más',
      human: 'Humana',
      and: 'y',
      accessible: 'Accesible',
      subtitle: 'Únete al movimiento que redefine el cuidado dental a través de la ciencia biomimética, conectando a estudiantes de todo el mundo con una educación asequible y accesible.'
    }
  },
  // Add other languages as empty objects or placeholders
  fr: {}, de: {}, pt: {}, it: {}, zh: {}, ja: {}, ko: {}, ar: {}
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
  currentLanguage: Language;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const stored = localStorage.getItem('language') as LanguageCode;
    return (stored && translations[stored]) ? stored : 'en';
  });

  const setLanguage = (code: LanguageCode) => {
    setLanguageState(code);
    localStorage.setItem('language', code);
  };

  const currentLanguage = languages.find(l => l.code === language) || languages[0];

  const t = (key: string): string => {
    const keys = key.split('.');
    let result = translations[language] || translations['en'];

    for (const k of keys) {
      result = result?.[k];
    }

    if (typeof result !== 'string') {
      // Fallback to English if translation is missing
      let fallback = translations['en'];
      for (const k of keys) {
        fallback = fallback?.[k];
      }
      return typeof fallback === 'string' ? fallback : key;
    }

    return result;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, currentLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
