import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

import en from './locales/en.json';
import ru from './locales/ru.json';

export const LANGUAGE_STORAGE_KEY = 'language';
export type AppLanguage = 'en' | 'ru';

function getDeviceLanguage(): AppLanguage {
  // expo-localization is sync and reliable on native + web
  const locale =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Localization as any).locale ||
    Localization.getLocales?.()?.[0]?.languageTag ||
    'en';
  const lower = String(locale).toLowerCase();
  return lower.startsWith('ru') ? 'ru' : 'en';
}

async function getInitialLanguage(): Promise<AppLanguage> {
  try {
    const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored === 'ru' || stored === 'en') return stored;
  } catch {
    // ignore
  }
  return getDeviceLanguage();
}

export async function setAppLanguage(lang: AppLanguage) {
  i18n.changeLanguage(lang);
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  } catch {
    // ignore
  }
}

// Initialize synchronously with default 'en', then switch if stored preference exists.
i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  resources: {
    en: { translation: en },
    ru: { translation: ru },
  },
  lng: getDeviceLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

getInitialLanguage().then((lang) => {
  if (lang !== i18n.language) {
    i18n.changeLanguage(lang);
  }
});

export default i18n;


