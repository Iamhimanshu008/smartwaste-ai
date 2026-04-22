import { translations } from './translations';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useLanguageStore = create(
  persist(
    (set, get) => ({
      lang: 'en',
      setLang: (lang) => set({ lang }),
    }),
    {
      name: 'smartwaste-lang',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Reactive translation hook — re-renders when lang changes
export const useTranslation = () => {
  const lang = useLanguageStore(state => state.lang);
  return {
    t: (key) => translations[lang]?.[key] || translations['en']?.[key] || key,
    lang,
    setLang: useLanguageStore.getState().setLang,
  };
};
