import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  Platform,
  ViewStyle,
} from 'react-native';

type ResendButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  width?: number;
  height?: number;
  fontSize?: number;
};

export function ResendButton({
  title,
  onPress,
  disabled = false,
  style,
  width,
  height,
  fontSize,
}: ResendButtonProps) {
  const buttonStyle = [
    styles.button,
    width && { width },
    height && { height, borderRadius: height / 2 },
    disabled && styles.buttonDisabled,
    style,
  ];

  const textStyle = [
    styles.buttonText,
    fontSize && { fontSize },
    disabled && styles.buttonTextDisabled,
  ];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={buttonStyle}
    >
      <Text style={textStyle}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonDisabled: {
    opacity: 0.4,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: Platform.select({
      ios: 'Onest-Regular',
      android: 'Onest_400Regular',
      web: 'Onest, sans-serif',
    }),
    textAlign: 'center',
  },
  buttonTextDisabled: {
    color: 'rgba(255, 255, 255, 0.3)',
  },
});

