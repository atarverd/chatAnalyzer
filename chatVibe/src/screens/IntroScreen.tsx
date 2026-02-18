import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Image,
  TouchableOpacity,
  Linking,
  useWindowDimensions,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BackgroundWrapper } from '../components/BackgroundWrapper';
import { ImageAssets } from '../utils/imageCache';
import { GlassButton } from '../components/GlassButton';
import { useTranslation } from 'react-i18next';
import { useCaptureMetricMutation } from '../services/api';
import { AnalyticsMetric } from '../types/analytics';

type IntroScreenProps = {
  onStart: () => void;
  /** When true, hide Terms and Privacy links (e.g. when opened from menu) */
  hideLinks?: boolean;
};

export function IntroScreen({ onStart, hideLinks }: IntroScreenProps) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const [showSecurityStep, setShowSecurityStep] = useState(true);
  const horizontalPadding = width < 380 ? 20 : 34;
  const [captureMetric] = useCaptureMetricMutation();
  const firstStepSeenRef = useRef(false);
  const secondStepSeenRef = useRef(false);

  const trackMetric = (metric: AnalyticsMetric) => {
    captureMetric({ metric, device: Platform.OS }).catch(() => {});
  };

  useEffect(() => {
    if (showSecurityStep && !firstStepSeenRef.current) {
      firstStepSeenRef.current = true;
      trackMetric(AnalyticsMetric.INTRO_FIRST_STEP_SEEN);
    } else if (!showSecurityStep && !secondStepSeenRef.current) {
      secondStepSeenRef.current = true;
      trackMetric(AnalyticsMetric.INTRO_SECOND_STEP_SEEN);
    }
  }, [showSecurityStep]);

  const features = [
    {
      icon: ImageAssets.chatIcon,
      text: t('intro.features.comunicationStyle'),
    },
    {
      icon: ImageAssets.sprakIcon,
      text: t('intro.features.emotionalTone'),
    },
    {
      icon: ImageAssets.graphIcon,
      text: t('intro.features.initiativeBalance'),
    },
  ];

  if (showSecurityStep) {
    return (
      <BackgroundWrapper
        showGlow={false}
        showHeader={false}
        style={styles.securityStepBackground}
      >
        <SafeAreaView
          style={styles.safeArea}
          edges={Platform.OS === 'android' ? ['bottom'] : []}
        >
          <View style={[styles.securityContainer]}>
            <View style={styles.securityCard}>
              <View style={styles.privacyIconContainer}>
                <Image
                  source={ImageAssets.shieldIcon}
                  style={styles.icon}
                  resizeMode='contain'
                />
              </View>
              <Text style={[styles.securityTitle, { width: '100%' }]}>
                {t('intro.securityTitle')}
              </Text>
              <Text style={styles.securityText}>
                {t('intro.securityAccess')}
              </Text>
              <Text style={styles.securityText}>
                {t('intro.securityNoStore')}
              </Text>
              <View style={styles.securityButtonWrapper}>
                <GlassButton
                  title={
                    hideLinks ? t('common.okay') : t('intro.securityContinue')
                  }
                  onPress={() => {
                    trackMetric(
                      AnalyticsMetric.INTRO_FIRST_STEP_BUTTON_CLICKED,
                    );
                    hideLinks ? onStart() : setShowSecurityStep(false);
                  }}
                />
              </View>
            </View>
          </View>
        </SafeAreaView>
      </BackgroundWrapper>
    );
  }

  return (
    <BackgroundWrapper showGlow showHeader>
      <SafeAreaView
        style={styles.safeArea}
        edges={Platform.OS === 'android' ? ['bottom'] : []}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingHorizontal: horizontalPadding },
          ]}
        >
          <View style={styles.content}>
            <Text style={[styles.mainHeading, { width: '100%' }]}>
              {t('intro.title')}
            </Text>

            <LinearGradient
              colors={['rgba(170, 224, 183, 0.3)', 'rgba(87, 94, 89, 0.3)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.featuresCardBorder}
            >
              <View style={styles.featuresCard}>
                <Text style={styles.featuresTitle}>
                  {t('intro.whatWeAnalyze')}
                </Text>
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
                <Text style={styles.privacyText}>{t('intro.privacy')}</Text>
              </View>
            </LinearGradient>
          </View>

          <View style={styles.buttonContainer}>
            <GlassButton
              title={t('intro.start')}
              onPress={() => {
                trackMetric(AnalyticsMetric.INTRO_SECOND_STEP_BUTTON_CLICKED);
                onStart();
              }}
            />
            {!hideLinks && (
              <View style={[styles.linksRow, { gap: width < 380 ? 12 : 24 }]}>
                <TouchableOpacity
                  onPress={() =>
                    Linking.openURL('https://chatvibe.dategram.io/terms')
                  }
                  activeOpacity={0.7}
                >
                  <Text style={styles.linkText}>{t('intro.termsOfUse')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    Linking.openURL('https://chatvibe.dategram.io/privacy')
                  }
                  activeOpacity={0.7}
                >
                  <Text style={styles.linkText}>
                    {t('intro.privacyPolicy')}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
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
    paddingBottom: 36,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainHeading: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 32,
    fontFamily: Platform.select({
      ios: 'Onest-SemiBold',
      android: 'Onest-SemiBold',
      web: 'Onest, sans-serif',
    }),
    lineHeight: 28,
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
      android: 'Onest-SemiBold',
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
      android: 'Onest-Regular',
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
      android: 'Onest-Regular',
      web: 'Onest, sans-serif',
    }),
    lineHeight: 20,
    letterSpacing: 0,
  },
  buttonContainer: {
    marginTop: 'auto',
    alignItems: 'center',
  },
  linksRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    marginTop: 20,
  },
  linkText: {
    fontFamily: Platform.select({
      ios: 'Onest-Regular',
      android: 'Onest-Regular',
      web: 'Onest, sans-serif',
    }),
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 20,
    letterSpacing: 0,
    textAlign: 'center',
    textDecorationLine: 'underline',
    color: '#F7FDFA',
  },
  securityContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 34,
  },
  securityCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  securityIconWrapper: {
    marginBottom: 24,
  },
  securityIcon: {
    width: 64,
    height: 64,
  },
  securityTitle: {
    fontFamily: Platform.select({
      ios: 'Onest-SemiBold',
      android: 'Onest-SemiBold',
      web: 'Onest, sans-serif',
    }),
    fontWeight: '600',
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: 0,
    textAlign: 'center',
    color: '#fff',
    marginVertical: 10,
  },
  securityText: {
    fontFamily: Platform.select({
      ios: 'SF-Pro',
      android: 'SF-Pro',
      web: 'SF-Pro, sans-serif',
    }),
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    color: '#C5C1B9',
    marginBottom: 12,
  },
  securityButtonWrapper: {
    marginTop: 24,
    width: '100%',
  },
  securityStepBackground: {
    backgroundColor: '#141414',
  },
});
