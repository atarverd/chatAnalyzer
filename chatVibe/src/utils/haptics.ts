import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export type HapticType = 'success' | 'error';

export async function triggerHaptic(type: HapticType) {
  if (Platform.OS === 'web') return;

  try {
    if (Platform.OS === 'android') {
      if (type === 'success') {
        await Haptics.performAndroidHapticsAsync(
          //@ts-ignore
          Haptics.AndroidHapticsType.LongPress
        );
      } else {
        await Haptics.performAndroidHapticsAsync(
          //@ts-ignore
          Haptics.AndroidHapticsType.VirtualKey
        );
      }
    } else {
      if (type === 'success') {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
      } else {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Error
        );
      }
    }
  } catch {
    // haptics unavailable 
  }
}

