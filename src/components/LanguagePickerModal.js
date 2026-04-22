import React from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet
} from 'react-native';
import { useLanguageStore, useTranslation } from '../i18n';

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिंदी' },
  { code: 'cg', label: 'Chhattisgarhi', native: 'छत्तीसगढ़ी' },
];

const LanguagePickerModal = ({ visible, onClose }) => {
  const { lang, setLang } = useLanguageStore();
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity 
        style={styles.overlay} 
        onPress={onClose} 
        activeOpacity={1}
      >
        <View style={styles.sheet}>
          <Text style={styles.title}>{t('select_language')}</Text>
          {LANGUAGES.map(item => (
            <TouchableOpacity
              key={item.code}
              style={[
                styles.option,
                lang === item.code && styles.activeOption
              ]}
              onPress={() => { setLang(item.code); onClose(); }}
            >
              <Text style={[
                styles.optionText,
                lang === item.code && styles.activeText
              ]}>
                {item.native}
              </Text>
              {lang === item.code && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24, paddingBottom: 40,
  },
  title: {
    color: '#4ade80', fontSize: 18,
    fontWeight: '700', textAlign: 'center',
    marginBottom: 20,
  },
  option: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 14,
    paddingHorizontal: 16, borderRadius: 10,
    marginBottom: 8, backgroundColor: 'rgba(255,255,255,0.05)',
  },
  activeOption: { backgroundColor: 'rgba(74,222,128,0.15)',
    borderWidth: 1, borderColor: '#4ade80' },
  optionText: { color: '#ffffff', fontSize: 16 },
  activeText: { color: '#4ade80', fontWeight: '700' },
  checkmark: { color: '#4ade80', fontSize: 18, fontWeight: '700' },
});

export default LanguagePickerModal;
