import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BackgroundWrapper } from '../components/BackgroundWrapper';
import { Button } from '../components/Button';
import { ImageAssets } from '../utils/imageCache';
import { GlassButton } from '../components/GlassButton';

type IntroScreenProps = {
  onStart: () => void;
};

export function IntroScreen({ onStart }: IntroScreenProps) {
  const features = [
    {
      icon: ImageAssets.chatIcon,
      text: 'Стиль общения',
    },
    {
      icon: ImageAssets.sprakIcon,
      text: 'Эмоциональный фон',
    },
    {
      icon: ImageAssets.graphIcon,
      text: 'Баланс инициативы',
    },
  ];

  return (
    <BackgroundWrapper showGlow showHeader>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.content}>
            <Text style={styles.mainHeading}>
              Проанализируйте ваши Telegram-чаты с AI
            </Text>

            <LinearGradient
              colors={['rgba(170, 224, 183, 0.3)', 'rgba(87, 94, 89, 0.3)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.featuresCardBorder}
            >
              <View style={styles.featuresCard}>
                <Text style={styles.featuresTitle}>ЧТО МЫ АНАЛИЗИРУЕМ</Text>
                {features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <View style={styles.featureIconContainer}>
                      <Image
                        source={feature.icon}
                        style={styles.icon}
                        resizeMode='contain'
                      />
                    </View>
                    <Text style={styles.featureText}>{feature.text}</Text>
                  </View>
                ))}
              </View>
            </LinearGradient>

            <LinearGradient
              colors={['rgba(52, 199, 89, 0.3)', 'rgba(25, 97, 43, 0.3)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.privacyCardBorder}
            >
              <View style={styles.privacyCard}>
                <View style={styles.privacyIconContainer}>
                  <Image
                    source={ImageAssets.shieldIcon}
                    style={styles.icon}
                    resizeMode='contain'
                  />
                </View>
                <Text style={styles.privacyText}>
                  Мы не храним вашу переписку и удаляем ее сразу после анализа
                </Text>
              </View>
            </LinearGradient>
          </View>

          <View style={styles.buttonContainer}>
            {/* <Button title='Начать' onPress={onStart} /> */}
            <GlassButton title='Начать' onPress={onStart} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 90,
    paddingBottom: 26,
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },
  mainHeading: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 32,
    fontFamily: Platform.select({
      ios: 'Onest-SemiBold',
      android: 'Onest_600SemiBold',
      web: 'Onest, sans-serif',
    }),
    lineHeight: 22,
    letterSpacing: 0,
  },
  featuresCardBorder: {
    borderRadius: 16,
    padding: 1,
    marginBottom: 16,
    width: '100%',
    maxWidth: 400,
  },
  featuresCard: {
    backgroundColor: '#151715',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    paddingBottom: 5,
  },
  featuresTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F7FDFA',
    marginBottom: 16,
    opacity: 0.4,
    fontFamily: Platform.select({
      ios: 'Onest-SemiBold',
      android: 'Onest_600SemiBold',
      web: 'Onest, sans-serif',
    }),
    lineHeight: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF0D',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    width: 20,
    height: 20,
  },
  featureText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#fff',
    fontFamily: Platform.select({
      ios: 'Onest-Regular',
      android: 'Onest_400Regular',
      web: 'Onest, sans-serif',
    }),
    lineHeight: 20,
    letterSpacing: 0,
  },
  privacyCardBorder: {
    borderRadius: 16,
    padding: 1,
    marginBottom: 32,
    width: '100%',
    maxWidth: 400,
  },
  privacyCard: {
    backgroundColor: '#141715',
    borderRadius: 15,
    padding: 18,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  privacyIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(58, 228, 120, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  privacyText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    color: '#fff',
    fontFamily: Platform.select({
      ios: 'Onest-Regular',
      android: 'Onest_400Regular',
      web: 'Onest, sans-serif',
    }),
    lineHeight: 20,
    letterSpacing: 0,
  },
  buttonContainer: {
    marginTop: 'auto',
    alignItems: 'center',
  },
});
