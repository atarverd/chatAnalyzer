import React from 'react';
import {
  View,
  StyleSheet,
  Platform,
  StyleProp,
  ViewStyle,
  Text,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaskedView from '@react-native-masked-view/masked-view';
import { ImageAssets } from '../utils/imageCache';
import { BackButton } from './BackButton';

type BackgroundWrapperProps = {
  showIcon?: boolean;
  showGlow?: boolean;
  showHeader?: boolean;
  showBackButton?: boolean;
  onBackPress?: () => void;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

export function BackgroundWrapper({
  showIcon = false,
  showGlow = false,
  showHeader = false,
  showBackButton = false,
  onBackPress,
  style,
  children,
}: BackgroundWrapperProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        children ? styles.containerWithChildren : undefined,
        style,
      ]}
    >
      {showHeader && (
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <LinearGradient
            colors={['#083C15', '#171E18']}
            locations={[0.1647, 0.8353]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.12, y: 0.99 }}
            style={styles.headerBorder}
          >
            <LinearGradient
              colors={['#202020', '#071503']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.headerContent}
            >
              <View style={styles.headerLogoContainer}>
                <ExpoImage
                  source={ImageAssets.icon}
                  style={styles.headerLogo}
                  contentFit='contain'
                />
              </View>
              {Platform.OS === 'web' ? (
                <View style={styles.headerTextWebContainer}>
                  <Text
                    style={[
                      styles.headerTextMaskText,
                      {
                        background:
                          'linear-gradient(90deg, #3F7B52 0%, #5ABC79 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        color: 'transparent',
                      } as any,
                    ]}
                  >
                    ChatVibe
                  </Text>
                </View>
              ) : (
                <View style={styles.headerTextMask}>
                  <MaskedView
                    style={styles.headerTextMaskView}
                    maskElement={
                      <View style={styles.headerTextMaskContainer}>
                        <Text style={styles.headerTextMaskText}>ChatVibe</Text>
                      </View>
                    }
                  >
                    <LinearGradient
                      colors={['#3F7B52', '#5ABC79']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.headerTextGradient}
                    >
                      <View style={styles.headerTextGradientPlaceholder} />
                    </LinearGradient>
                  </MaskedView>
                </View>
              )}
            </LinearGradient>
          </LinearGradient>
        </View>
      )}
      {showIcon && (
        <ExpoImage
          source={ImageAssets.icon}
          style={styles.icon}
          contentFit='contain'
        />
      )}
      {showGlow && <View style={styles.greenGlow} />}
      {showBackButton && onBackPress && (
        <View style={[styles.backButtonContainer, { paddingTop: insets.top + 16 }]}>
          <BackButton onPress={onBackPress} />
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    position: 'relative',
    paddingBottom: 0,
    marginBottom: 0,
  },
  containerWithChildren: {
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    paddingBottom: 0,
    marginBottom: 0,
  },
  icon: {
    width: 81,
    height: 81,
  },
  greenGlow: {
    position: 'absolute',
    bottom: -335,
    alignSelf: 'center',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#016801',
    opacity: 1,
    ...(Platform.OS === 'web' && {
      filter: 'blur(64px)',
    }),
    shadowColor: '#016801',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 80,
    elevation: 0,
  },
  header: {
    width: '100%',
    paddingHorizontal: 16,
    paddingBottom: 16,
    alignItems: 'center',
  },
  headerBorder: {
    borderRadius: 60,
    padding: 1,
    width: 167,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 167,
    height: 49,
    borderRadius: 59,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  headerLogoContainer: {
    width: 31,
    height: 31,
    marginLeft: 9,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerLogo: {
    width: 31,
    height: 31,
  },
  headerTextMask: {
    flex: 1,
    marginRight: 20,
    justifyContent: 'center',
    alignItems: 'center',
    height: 22,
  },
  headerTextMaskView: {
    width: '100%',
    height: 22,
  },
  headerTextMaskContainer: {
    width: '100%',
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextMaskText: {
    fontSize: 22,
    fontWeight: '600',
    fontFamily: Platform.select({
      ios: 'Outfit-SemiBold',
      android: 'Outfit_600SemiBold',
      web: 'Outfit, sans-serif',
    }),
    lineHeight: 22,
    letterSpacing: 0,
    textAlign: 'center',
    color: '#fff',
  },
  headerTextGradient: {
    width: '100%',
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextGradientPlaceholder: {
    width: '100%',
    height: 22,
  },
  headerTextGradientInner: {
    flex: 1,
  },
  headerTextWebContainer: {
    flex: 1,
    marginRight: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonContainer: {
    position: 'absolute',
    left: 24,
    top: 0,
    zIndex: 10,
  },
});
