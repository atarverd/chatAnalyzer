import React from 'react';
import { TouchableOpacity, View, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

type MenuButtonProps = {
  onPress: () => void;
};

export function MenuButton({ onPress }: MenuButtonProps) {
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
        style={styles.menuButtonBorder}
      >
        <View style={styles.menuButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#fff" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  menuButtonBorder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    padding: 1,
    marginLeft: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 40,
    elevation: 3,
  },
  menuButton: {
    flex: 1,
    borderRadius: 23,
    backgroundColor: '#151515CC',
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
    }),
  },
});
