import { Platform } from 'react-native';
import * as Application from 'expo-application';
import AsyncStorage from '@react-native-async-storage/async-storage';

const INSTALL_ID_KEY = '@chatvibe/install_id';

function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

let cachedId: string | null = null;

/**
 * Returns a device/install ID using native APIs when available:
 * - Android: Application.getAndroidId() (ANDROID_ID)
 * - iOS: Application.getIosIdForVendorAsync() (IDFV)
 * - Web / fallback: generated UUID stored in AsyncStorage
 */
export async function getInstallId(): Promise<string> {
  if (cachedId) return cachedId;

  try {
    if (Platform.OS === 'android') {
      cachedId = Application.getAndroidId();
      return cachedId;
    }

    if (Platform.OS === 'ios') {
      const idfv = await Application.getIosIdForVendorAsync();
      if (idfv) {
        cachedId = idfv;
        return idfv;
      }
    }

    // Web or iOS when IDFV is null: use stored/generated ID
    const stored = await AsyncStorage.getItem(INSTALL_ID_KEY);
    if (stored) {
      cachedId = stored;
      return stored;
    }

    const id = generateId();
    await AsyncStorage.setItem(INSTALL_ID_KEY, id);
    cachedId = id;
    return id;
  } catch {
    return generateId();
  }
}
