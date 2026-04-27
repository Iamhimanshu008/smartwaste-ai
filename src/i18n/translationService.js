import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = 'gtrans_v1_';
const CACHE_DAYS = 30;
const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

export const translateText = async (text, targetLang) => {
  if (!text || typeof text !== 'string' || targetLang === 'en') return text;
  
  const cacheKey = `${CACHE_PREFIX}${targetLang}_${text.substring(0, 80).replace(/\s/g, '_')}`;
  
  try {
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      const { value, timestamp } = JSON.parse(cached);
      if ((Date.now() - timestamp) / 86400000 < CACHE_DAYS) return value;
    }
  } catch {}

  try {
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: text,
          target: targetLang === 'cg' ? 'hi' : targetLang,
          source: 'en',
          format: 'text'
        })
      }
    );
    const data = await response.json();
    const translated = data?.data?.translations?.[0]?.translatedText;
    if (translated) {
      await AsyncStorage.setItem(cacheKey, JSON.stringify({
        value: translated, timestamp: Date.now()
      }));
      return translated;
    }
  } catch (err) {
    console.log('Google Translate error:', err.message);
  }
  return text;
};

export const translateBatch = async (textsObj, targetLang) => {
  if (!textsObj || targetLang === 'en') return textsObj;
  const keys = Object.keys(textsObj);
  const values = Object.values(textsObj);
  if (keys.length === 0) return textsObj;
  
  try {
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: values,
          target: targetLang === 'cg' ? 'hi' : targetLang,
          source: 'en',
          format: 'text'
        })
      }
    );
    const data = await response.json();
    const translated = data?.data?.translations;
    if (translated && translated.length === keys.length) {
      const result = {};
      keys.forEach((k, i) => { result[k] = translated[i].translatedText; });
      return result;
    }
  } catch (err) {
    console.log('Batch translate error:', err.message);
  }
  return textsObj;
};
