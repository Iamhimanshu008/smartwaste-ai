import { translations } from './translations';
import { translateBatch } from './translationService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useLanguageStore = create(
  persist(
    (set, get) => ({
      lang: 'en',
      apiCache: {},       // { hi: { key: value } }
      isLoading: false,

      setLang: async (lang) => {
        set({ lang });
        if (lang === 'en' || lang === 'cg') return;
        // CG uses JSON only — no API

        // Already cached in store
        if (get().apiCache?.[lang]) return;

        // Fetch Hindi from MyMemory
        set({ isLoading: true });
        try {
          const result = await translateBatch(translations.en, lang);
          if (result) {
            set(state => ({
              apiCache: { ...state.apiCache, [lang]: result },
              isLoading: false,
            }));
          } else {
            set({ isLoading: false });
          }
        } catch (e) {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'sw-lang-v2',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Reactive translation hook — re-renders when lang changes
export const useTranslation = () => {
  const lang = useLanguageStore(state => state.lang);
  const apiCache = useLanguageStore(state => state.apiCache);
  const isLoading = useLanguageStore(state => state.isLoading);
  const setLang = useLanguageStore(state => state.setLang);

  const t = (key, langOverride) => {
    const currentLang = langOverride || lang;
    if (!key) return '';
    if (!currentLang || currentLang === 'en') return key;
    return translations[currentLang]?.[key] || key;
  };

  return { t, lang, setLang, isLoading };
};

export const t = (key, lang) => {
  if (!key) return '';
  if (!lang || lang === 'en') return key;
  return translations[lang]?.[key] || key;
};
