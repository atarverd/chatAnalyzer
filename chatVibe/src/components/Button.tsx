import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type ButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

export function Button({
  title,
  onPress,
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.buttonContainer,
        isDisabled && styles.buttonDisabled,
        style,
      ]}
    >
      <View style={styles.buttonWrapper}>
        {/* BG layer */}
        <View style={styles.bgLayer} />

        {/* Blur layer (hidden but present for effect) */}
        <View style={styles.blurLayer} />

        {/* Tint layer with complex gradient blend */}
        <View style={styles.tintLayer}>
          {/* Base green gradient */}
          <LinearGradient
            colors={
              isDisabled
                ? [
                    'rgba(0, 98, 1, 0.4)',
                    'rgba(1, 105, 1, 0.2)',
                    'rgba(4, 112, 8, 0.3)',
                  ]
                : ['#006201', '#016901', 'rgba(4, 112, 8, 1)']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.tintGradient}
          />
          {/* White overlay for blend effect */}
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.5)', 'rgba(255, 255, 255, 0.3)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.tintOverlay1}
          />
          {/* Gray overlay for depth */}
          <LinearGradient
            colors={['rgba(153, 153, 153, 0.15)', 'rgba(153, 153, 153, 0.08)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.tintOverlay2}
          />
          {/* Additional white overlay for saturation effect */}
          <View style={styles.tintOverlay3} />
        </View>

        {/* Glass effect layer */}
        <View style={styles.glassLayer} />

        {/* Text container */}
        <View style={styles.textContainer}>
          {loading ? (
            <ActivityIndicator color='#fff' size='small' />
          ) : (
            <Text
              style={[
                styles.buttonText,
                isDisabled
                  ? styles.buttonTextDisabled
                  : styles.buttonTextActive,
                textStyle,
              ]}
            >
              {title}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    width: 334,
    height: 52,
    borderRadius: 1000,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow:
          '0px 0px 2px rgba(0, 0, 0, 0.1), 0px 1px 8px rgba(0, 0, 0, 0.12)',
      },
    }),
  },
  buttonWrapper: {
    width: '100%',
    height: '100%',
    borderRadius: 1000,
    overflow: 'hidden',
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 6,
    paddingRight: 20,
    paddingBottom: 6,
    paddingLeft: 20,
    gap: 4,
    isolation: 'isolate',
  },
  bgLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 0,
  },
  blurLayer: {
    position: 'absolute',
    left: -26,
    right: -26,
    top: -26,
    bottom: -26,
    opacity: 0.67,
    ...Platform.select({
      web: {
        visibility: 'hidden',
        filter: 'blur(20px)',
        backdropFilter: 'blur(20px)',
      },
    }),
  },
  tintLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 1000,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow:
          '0px 0px 2px rgba(0, 0, 0, 0.1), 0px 1px 8px rgba(0, 0, 0, 0.12)',
      },
    }),
  },
  tintGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  tintOverlay1: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.6,
  },
  tintOverlay2: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.3,
  },
  tintOverlay3: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  glassLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.004)',
    borderRadius: 296,
  },
  textContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
    borderRadius: 100,
    zIndex: 1,
    flex: 0,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '500',
    fontFamily: Platform.select({
      ios: 'SF Pro Text',
      android: 'SF-Pro',
      web: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
    }),
    lineHeight: 20,
    letterSpacing: 0,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  buttonTextActive: {
    color: '#FFFFFF',
  },
  buttonTextDisabled: {
    color: '#FFFFFF',
    opacity: 0.4,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
});
