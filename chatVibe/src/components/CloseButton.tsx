import React from 'react';
import { TouchableOpacity, View, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image as ExpoImage } from 'expo-image';
import { ImageAssets } from '../utils/imageCache';

type CloseButtonProps = {
  onPress: () => void;
};

export function CloseButton({ onPress }: CloseButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <LinearGradient
        colors={[
          'rgba(255, 255, 255, 0.12)',
          'rgba(255, 255, 255, 0.02)',
          'rgba(255, 255, 255, 0.12)',
        ]}
        locations={[0.1443, 0.4978, 0.8512]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={styles.closeButtonBorder}
      >
        <View style={styles.closeButton}>
          <ExpoImage
            source={ImageAssets.closeIcon}
            style={styles.closeButtonIcon}
            contentFit='contain'
          />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  closeButtonBorder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    padding: 1,
  },
  closeButton: {
    flex: 1,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#151515CC',
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
    }),
  },
  closeButtonIcon: {
    width: 16,
    height: 16,
  },
});

