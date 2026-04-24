import AsyncStorage from '@react-native-async-storage/async-storage';

const MYMEMORY_URL = 'https://api.mymemory.translated.net/get';
const SINGLE_CACHE_PREFIX = 'sw_str_v1_';

// In-memory cache for current session (fast lookups)
const memoryCache = {};

export const translateSingle = async (text, targetLang) => {
  if (!text || targetLang === 'en' || text.trim() === '') return text;
  if (targetLang === 'cg') return null; // CG uses JSON only

  // Check memory cache first (instant)
  const memKey = `${targetLang}:${text}`;
  if (memoryCache[memKey]) return memoryCache[memKey];

  // Check AsyncStorage cache
  const storageKey = `${SINGLE_CACHE_PREFIX}${targetLang}_${text.slice(0, 30).replace(/\s/g, '_')}`;
  try {
    const cached = await AsyncStorage.getItem(storageKey);
    if (cached) {
      memoryCache[memKey] = cached;
      return cached;
    }
  } catch (e) {}

  // Call MyMemory API
  try {
    const langPair = `en|hi`;
    const url = `${MYMEMORY_URL}?q=${encodeURIComponent(text)}&langpair=${langPair}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    const data = await res.json();

    if (data.responseStatus === 200 && data.responseData.translatedText) {
      const translated = data.responseData.translatedText;
      // Save to both caches
      memoryCache[memKey] = translated;
      await AsyncStorage.setItem(storageKey, translated);
      return translated;
    }
  } catch (e) {}

  return null; // Return null = show original text
};

export const translateBatch = async (texts, targetLang) => {
  if (targetLang !== 'hi') return null;

  const cacheKey = `sw_trans_v1_${targetLang}`;
  try {
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < 30 * 24 * 60 * 60 * 1000) return data;
    }
  } catch (e) {}

  const keys = Object.keys(texts);
  const values = Object.values(texts);
  const translated = {};
  const BATCH_SIZE = 5;

  for (let i = 0; i < keys.length; i += BATCH_SIZE) {
    const batchKeys = keys.slice(i, i + BATCH_SIZE);
    const batchValues = values.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batchValues.map(text => translateSingle(text, targetLang))
    );
    results.forEach((result, idx) => {
      if (result.status === 'fulfilled' && result.value) {
        translated[batchKeys[idx]] = result.value;
      }
    });
    if (i + BATCH_SIZE < keys.length) {
      await new Promise(r => setTimeout(r, 300));
    }
  }

  if (Object.keys(translated).length > 0) {
    await AsyncStorage.setItem(
      cacheKey,
      JSON.stringify({ data: translated, timestamp: Date.now() })
    );
  }
  return Object.keys(translated).length > 0 ? translated : null;
};
