import React, { useState, useEffect, useRef } from 'react';
import { Text } from 'react-native';
import { useLanguageStore } from '../i18n';
import { translateSingle } from '../i18n/translationService';
import { translations } from '../i18n/translations';

const AutoText = ({ children, style, numberOfLines, ...props }) => {
  const lang = useLanguageStore(state => state.lang);
  const apiCache = useLanguageStore(state => state.apiCache);
  const [displayText, setDisplayText] = useState(children);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    if (!children || typeof children !== 'string') {
      setDisplayText(children);
      return;
    }

    if (lang === 'en') {
      setDisplayText(children);
      return;
    }

    if (lang === 'cg') {
      // Check if translation exists in CG JSON by value lookup
      const cgKeys = Object.keys(translations.en || {});
      const matchKey = cgKeys.find(k => translations.en[k] === children);
      if (matchKey && translations.cg?.[matchKey]) {
        setDisplayText(translations.cg[matchKey]);
      } else {
        setDisplayText(children);
      }
      return;
    }

    // Hindi: check apiCache first
    if (lang === 'hi' && apiCache?.hi) {
      const hiKeys = Object.keys(translations.en || {});
      const matchKey = hiKeys.find(k => translations.en[k] === children);
      if (matchKey && apiCache.hi[matchKey]) {
        setDisplayText(apiCache.hi[matchKey]);
        return;
      }
    }

    // Translate on the fly via API
    setDisplayText(children); // Show original immediately
    const translate = async () => {
      const result = await translateSingle(children, lang);
      if (isMounted.current && result) {
        setDisplayText(result);
      }
    };
    translate();

  }, [children, lang, apiCache]);

  return (
    <Text style={style} numberOfLines={numberOfLines} {...props}>
      {displayText}
    </Text>
  );
};

export default AutoText;
