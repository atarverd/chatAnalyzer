import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ViewStyle,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
type Props = {
  title: string;
  onPress: () => void;
  glassEffectStyle?: 'regular' | 'clear' | 'thick' | 'thin';
  style?: ViewStyle;
  disabled?: boolean;
};

export const GlassButton = ({
  title,
  onPress,
  glassEffectStyle = 'regular',
  style,
  disabled = false,
}: Props) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[styles.touchableOpacity, disabled && styles.disabled]}
    >
      {disabled ? (
        <View style={styles.backButtonBorderDisabled}>
          <LinearGradient
            colors={['#006601', '#016901', '#036c03', '#047007']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.backButton}
          >
            <Text
              style={[styles.backButtonIcon, disabled && styles.disabledText]}
            >
              {title}
            </Text>
          </LinearGradient>
        </View>
      ) : (
        <LinearGradient
          colors={[
            'rgba(171, 255, 171, 0.79)',
            'rgba(171, 255, 171, 0.55)',
            'rgba(171, 255, 171, 0.4)',
            'rgba(171, 255, 171, 0.3)',
            'rgba(171, 255, 171, 0.13)',
          ]}
          locations={[0, 0.25, 0.5, 0.75, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.backButtonBorder}
        >
          <LinearGradient
            colors={['#006601', '#016901', '#036c03', '#047007']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.backButton}
          >
            <Text
              style={[styles.backButtonIcon, disabled && styles.disabledText]}
            >
              {title}
            </Text>
          </LinearGradient>
        </LinearGradient>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pressable: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  glass: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  touchableOpacity: {
    width: '100%',
  },
  backButtonBorder: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    padding: 1,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 40,
    elevation: 3,
  },
  backButtonBorderDisabled: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    padding: 0,
    marginRight: 12,
  },
  backButton: {
    flex: 1,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 9,
    paddingBottom: 9,
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
    }),
  },
  backButtonIcon: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '600',
  },
  disabled: {
    filter: 'brightness(0.5)',
    borderRadius: 23,
  },
  disabledText: {
    opacity: 1,
  },
});
