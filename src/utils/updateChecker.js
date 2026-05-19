import { Alert, Linking } from 'react-native';
import client from '../api/client';

export const compareVersions = (current, latest) => {
  const curr = current.split('.').map(Number);
  const lat = latest.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((lat[i] || 0) > (curr[i] || 0)) return true;  // update available
    if ((lat[i] || 0) < (curr[i] || 0)) return false;
  }
  return false; // same version
};

export const checkForUpdate = async (currentVersion, showNoUpdateAlert = false) => {
  try {
    const response = await client.get('/app/version');
    const { latest_version, apk_url, release_notes, force_update } = response.data;
    
    const updateAvailable = compareVersions(currentVersion, latest_version);
    
    if (updateAvailable) {
      Alert.alert(
        'New Update Available!',
        `Version ${latest_version} is available\n\n${release_notes}\n\nPlease update to get the latest features and fixes.`,
        [
          force_update ? null : { 
            text: 'Later', 
            style: 'cancel' 
          },
          {
            text: 'Download Update',
            onPress: () => Linking.openURL(apk_url),
          },
        ].filter(Boolean)
      );
      return true;
    } else {
      if (showNoUpdateAlert) {
        Alert.alert(
          'App is Up to Date',
          `You are using the latest version (${currentVersion}). No updates available.`,
          [{ text: 'OK' }]
        );
      }
      return false;
    }
  } catch (err) {
    if (showNoUpdateAlert) {
      Alert.alert(
        'Check Failed',
        'Could not check for updates. Please check your internet connection.',
        [{ text: 'OK' }]
      );
    }
    return false;
  }
};
