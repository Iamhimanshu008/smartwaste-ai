import React, { useState, useEffect } from 'react';
import { Text } from 'react-native';
import { useLanguageStore } from '../i18n';
import { translations } from '../i18n/translations';
import { translateText } from '../i18n/translationService';

const AutoText = ({ children, style, numberOfLines, ...props }) => {
  const language = useLanguageStore(state => state.lang);
  const [displayText, setDisplayText] = useState(
    typeof children === 'string' ? children : ''
  );

  useEffect(() => {
    if (!children || typeof children !== 'string') return;
    
    if (!language || language === 'en') {
      setDisplayText(children);
      return;
    }
    
    // Local translation first (instant)
    if (translations[language]?.[children]) {
      setDisplayText(translations[language][children]);
      return;
    }
    
    // Google Translate API fallback (async)
    translateText(children, language).then(result => {
      if (result && result !== children) {
        setDisplayText(result);
      }
    });
  }, [children, language]);

  return (
    <Text style={style} numberOfLines={numberOfLines} {...props}>
      {displayText || children}
    </Text>
  );
};

export default AutoText;
