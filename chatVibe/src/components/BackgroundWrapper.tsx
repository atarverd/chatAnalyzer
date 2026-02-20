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
import { MenuButton } from './MenuButton';

type BackgroundWrapperProps = {
  showIcon?: boolean;
  showGlow?: boolean;
  showHeader?: boolean;
  showBackButton?: boolean;
  onBackPress?: () => void;
  showMenuButton?: boolean;
  onMenuPress?: () => void;
  headerLogoPadding?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

export function BackgroundWrapper({
  showIcon = false,
  showGlow = false,
  showHeader = false,
  showBackButton = false,
  onBackPress,
  showMenuButton = false,
  onMenuPress,
  headerLogoPadding = true,
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
        <View
          style={[
            styles.header,
            { paddingTop: Platform.OS === 'web' ? 24 : insets.top + 24 },
          ]}
        >
          <View style={styles.headerRow}>
            <LinearGradient
              colors={['#144382', '#001A2B']}
              locations={[0.1647, 0.8353]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0.12, y: 0.99 }}
              style={styles.headerBorder}
            >
              <LinearGradient
                colors={['#093560', '#0D1F32']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.headerContent}
              >
                <View
                  style={[
                    styles.headerLogoContainer,
                    !headerLogoPadding && styles.headerLogoContainerNoPadding,
                  ]}
                >
                  <ExpoImage
                    source={ImageAssets.icon}
                    style={styles.headerLogo}
                    contentFit='contain'
                  />
                </View>
                {/* {Platform.OS === 'web' ? (
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
                          <Text style={styles.headerTextMaskText}>
                            ChatVibe
                          </Text>
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
                )} */}
              </LinearGradient>
            </LinearGradient>
          </View>
        </View>
      )}
      {showIcon && (
        <ExpoImage
          source={ImageAssets.icon}
          style={styles.icon}
          contentFit='contain'
        />
      )}
      {showGlow && (
        <ExpoImage
          source={ImageAssets.glow}
          style={[
            styles.greenGlow,
            Platform.OS === 'android' && { bottom: insets.bottom },
          ]}
          contentFit='fill'
        />
      )}
      {showBackButton && onBackPress && (
        <View
          style={[
            styles.backButtonContainer,
            {
              top:
                Platform.OS === 'web'
                  ? 24 + (49 - 48) / 2 // Header paddingTop (24) + half the difference between header height (49) and button height (48)
                  : insets.top + 24 + (49 - 48) / 2, // Header paddingTop (insets.top + 24) + half the difference
            },
          ]}
        >
          <BackButton onPress={onBackPress} />
        </View>
      )}
      {showMenuButton && onMenuPress && (
        <View
          style={[
            styles.menuButtonContainer,
            {
              top:
                Platform.OS === 'web'
                  ? 24 + (49 - 48) / 2
                  : insets.top + 24 + (49 - 48) / 2,
            },
          ]}
        >
          <MenuButton onPress={onMenuPress} />
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
    bottom: 0,
    left: '50%',
    marginLeft: -200,
    width: 400,
    height: 100,
  },

  header: {
    width: '100%',
    paddingHorizontal: 16,
    paddingBottom: 16,
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButtonContainer: {
    position: 'absolute',
    right: 24,
    zIndex: 10,
  },
  headerBorder: {
    borderRadius: 60,
    padding: 1,
    // width: 64,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    // width: 64,
    // height: 49,
    borderRadius: 59,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  headerLogoContainer: {
    // width: 41,
    // height: 41,
    // marginLeft: 9,
    // marginRight: 12,
    padding: 11.76,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerLogoContainerNoPadding: {
    padding: 0,
  },
  headerLogo: {
    width: 40.49,
    height: 40.49,
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
    zIndex: 10,
  },
});
