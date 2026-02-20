import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { BackgroundWrapper } from '../components/BackgroundWrapper';
import { ImageAssets } from '../utils/imageCache';
import { useTranslation } from 'react-i18next';
import { colors } from '../theme/colors';

type Props = {
  onComplete: () => void;
};

export function SuccessScreen({ onComplete }: Props) {
  const { t } = useTranslation();
  return (
    <BackgroundWrapper showIcon={false} showGlow={true} showHeader={true}>
      <View style={styles.container}>
        <View style={styles.checkmarkContainer}>
          <View style={styles.checkmarkCircle} />
          <ExpoImage
            source={ImageAssets.doneIcon}
            style={styles.checkmarkIcon}
            contentFit='contain'
          />
        </View>
        <Text style={styles.title}>{t('success.title')}</Text>
        <Text style={styles.subtitle}>{t('success.subtitle')}</Text>
      </View>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: -60,
  },
  checkmarkContainer: {
    marginBottom: 40,
    position: 'relative',
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkCircle: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.blue,
    opacity: 0.15,
    top: 0.5,
    left: 0.5,
  },
  checkmarkIcon: {
    width: 22,
    height: 22,
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: Platform.select({
      ios: 'Onest-SemiBold',
      android: 'Onest-SemiBold',
      web: 'Onest, sans-serif',
    }),
    lineHeight: 24,
    letterSpacing: 0,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#fff',
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: 'Onest-Regular',
      android: 'Onest-Regular',
      web: 'Onest, sans-serif',
    }),
    lineHeight: 20,
    letterSpacing: 0,
  },
});
