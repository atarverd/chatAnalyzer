import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
} from '@expo-google-fonts/outfit';
import { Onest_400Regular, Onest_600SemiBold } from '@expo-google-fonts/onest';
import { store } from './src/store';
import { AuthScreen } from './src/screens/AuthScreen';
import { ChatsScreen } from './src/screens/ChatsScreen';
import { IntroScreen } from './src/screens/IntroScreen';
import { SuccessScreen } from './src/screens/SuccessScreen';
import { useAuthStatusQuery } from './src/services/api';
import { BackgroundWrapper } from './src/components/BackgroundWrapper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { preloadImages, ImageAssets } from './src/utils/imageCache';

// Prevent auto-hiding splash screen until we're ready
SplashScreen.preventAutoHideAsync();

function SplashScreenComponent() {
  return (
    <BackgroundWrapper showIcon={true} showGlow={true} showHeader={false} />
  );
}

function Root() {
  const { data, isLoading } = useAuthStatusQuery();
  const [appIsReady, setAppIsReady] = useState(false);
  const [minSplashTimeElapsed, setMinSplashTimeElapsed] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [introChecked, setIntroChecked] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [wasAuthorized, setWasAuthorized] = useState(false);
  const splashOpacity = useRef(new Animated.Value(1)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  const [fontsLoaded] = useFonts({
    'Outfit-Regular': Outfit_400Regular,
    'Outfit-Medium': Outfit_500Medium,
    'Outfit-SemiBold': Outfit_600SemiBold,
    'Onest-Regular': Onest_400Regular,
    'Onest-SemiBold': Onest_600SemiBold,
  });

  useEffect(() => {
    // Hide native splash screen immediately and show our custom one
    SplashScreen.hideAsync();

    // Preload all images at startup
    preloadImages();

    // Check if intro has been shown before
    const checkIntroShown = async () => {
      try {
        const introShown = await AsyncStorage.getItem('introShown');
        // if (introShown === 'true') {
        //   setShowIntro(false);
        // }
        setIntroChecked(true);
      } catch (error) {
        setIntroChecked(true);
      }
    };

    checkIntroShown();

    // Minimum splash screen display time (3 seconds)
    const timer = setTimeout(() => {
      setMinSplashTimeElapsed(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleIntroComplete = async () => {
    try {
      await AsyncStorage.setItem('introShown', 'true');
      setShowIntro(false);
    } catch (error) {
      setShowIntro(false);
    }
  };

  useEffect(() => {
    // Wait for both: minimum 3 seconds elapsed AND API call completed AND fonts loaded AND intro checked
    if (!isLoading && minSplashTimeElapsed && fontsLoaded && introChecked) {
      // App is ready and minimum time elapsed - set ready first
      setAppIsReady(true);

      // Small delay to ensure content is rendered before animation
      setTimeout(() => {
        // Fade out splash screen and fade in content
        Animated.parallel([
          Animated.timing(splashOpacity, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(contentOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();
      }, 50);
    }
  }, [
    isLoading,
    minSplashTimeElapsed,
    fontsLoaded,
    introChecked,
    splashOpacity,
    contentOpacity,
  ]);

  // Monitor auth status changes to show success screen
  useEffect(() => {
    if (appIsReady && !showIntro && data?.authorized && !wasAuthorized) {
      // User just became authorized - show success screen
      setShowSuccess(true);
      setWasAuthorized(true);

      // After 3 seconds, hide success screen and show chats
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 3000);

      return () => clearTimeout(timer);
    } else if (appIsReady && !showIntro && !data?.authorized) {
      // User is not authorized - reset state
      setWasAuthorized(false);
      setShowSuccess(false);
    }
  }, [data?.authorized, appIsReady, showIntro, wasAuthorized]);

  const showSplash = isLoading || !appIsReady || !fontsLoaded;

  return (
    <View style={styles.rootContainer}>
      <ExpoImage
        source={ImageAssets.bgTop}
        style={styles.persistentBackground}
        contentFit='contain'
        contentPosition='top'
        priority='high'
        cachePolicy='memory-disk'
      />
      {showSplash && (
        <Animated.View
          style={[
            styles.splashWrapper,
            {
              opacity: splashOpacity,
            },
          ]}
          pointerEvents={showSplash ? 'auto' : 'none'}
        >
          <SplashScreenComponent />
        </Animated.View>
      )}
      <Animated.View
        style={[
          styles.contentWrapper,
          {
            opacity: contentOpacity,
          },
        ]}
        pointerEvents={appIsReady ? 'auto' : 'none'}
      >
        {appIsReady ? (
          showIntro ? (
            <IntroScreen onStart={handleIntroComplete} />
          ) : showSuccess ? (
            <SuccessScreen onComplete={() => setShowSuccess(false)} />
          ) : data?.authorized ? (
            <ChatsScreen />
          ) : (
            <AuthScreen />
          )
        ) : null}
      </Animated.View>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <StatusBar style='light' hidden={false} />
        <Root />
      </Provider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#141414',
  },
  persistentBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.4,
    alignSelf: 'flex-start',
    zIndex: 0,
  },
  splashWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  contentWrapper: {
    flex: 1,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
});
