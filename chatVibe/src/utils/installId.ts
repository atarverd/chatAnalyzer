import { Platform } from 'react-native';
import * as Application from 'expo-application';
import AsyncStorage from '@react-native-async-storage/async-storage';

const INSTALL_ID_KEY = '@chatvibe/install_id';

/** Converts Android ID (16 hex chars) to a deterministic UUID v4 format. */
function androidIdToUuid(androidId: string): string {
  const raw = androidId.toLowerCase().replace(/[^0-9a-f]/g, '');
  const hex = (raw + '0'.repeat(32)).slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(12, 15)}-8${hex.slice(15, 18)}-${hex.slice(18, 30)}`;
}

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
      const androidId = Application.getAndroidId();
      cachedId = androidIdToUuid(androidId);
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
