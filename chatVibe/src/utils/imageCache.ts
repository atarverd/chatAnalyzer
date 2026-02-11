import { Image, Platform } from 'react-native';

// Centralized image sources - ensures same reference across app
export const ImageAssets = {
  bgTop: require('../../assets/bg_top.png'),
  icon: require('../../assets/icon.png'),
  chatIcon: require('../../assets/chatIcon.png'),
  chatIconCard: require('../../assets/chatIconCard.png'),
  sprakIcon: require('../../assets/sprakIcon.png'),
  graphIcon: require('../../assets/graphIcon.png'),
  shieldIcon: require('../../assets/shieldIcon.png'),
  searchIcon: require('../../assets/searchIcon.png'),
  groupChatIcon: require('../../assets/groupIchatIcon.png'),
  privateChatIcon: require('../../assets/privateChatIcon.png'),
  arrowIcon: require('../../assets/arrowIcon.png'),
  arrowDown: require('../../assets/arrowDown.png'),
  heartIcon: require('../../assets/heartIcon.png'),
  chartIcon: require('../../assets/chartIcon.png'),
  questionIcon: require('../../assets/question.png'),
  alertIcon: require('../../assets/alertIcon.png'),
  closeIcon: require('../../assets/close.png'),
  doneIcon: require('../../assets/checkmark.png'),
  eye: require('../../assets/eye.png'),
  eyeClosed: require('../../assets/eyeClosed.png'),
  backIcon: require('../../assets/backIcon.png'),
  glow: require('../../assets/glow.png'),
  reAnalyzeIcon: require('../../assets/reAnalyzeIcon.png'),
  notEnough: require('../../assets/not_enough.png'),
};

// Preload all images at app startup
export const preloadImages = async (): Promise<void> => {
  const imageSources = Object.values(ImageAssets);

  try {
    if (Platform.OS === 'web') {
      // For web, preload by creating Image objects
      const preloadPromises = imageSources.map((source) => {
        return new Promise<void>((resolve) => {
          const resolvedSource = Image.resolveAssetSource(source);
          if (resolvedSource?.uri) {
            const img = new (window as any).Image();
            img.onload = () => resolve();
            img.onerror = () => resolve(); // Resolve even on error to not block
            img.src = resolvedSource.uri;
          } else {
            resolve();
          }
        });
      });
      await Promise.all(preloadPromises);
    } else {
      // For native, use Image.prefetch
      const preloadPromises = imageSources.map((source) => {
        const resolvedSource = Image.resolveAssetSource(source);
        if (resolvedSource?.uri) {
          return Image.prefetch(resolvedSource.uri).catch(() => {
            // Ignore prefetch errors
          });
        }
        return Promise.resolve();
      });
      await Promise.all(preloadPromises);
    }
  } catch (error) {
    // Silently fail - images will still load normally
    console.warn('Image preloading failed:', error);
  }
};
