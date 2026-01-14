import React, { useState, useRef, useEffect } from 'react';
import { View, FlatList, StyleSheet, Animated, AppState } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../store';
import { useGetChatsQuery, useAnalyzeChatMutation, api } from '../services/api';
import { logout } from '../features/auth/authSlice';
import Toast from 'react-native-toast-message';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChatsHeader } from '../components/ChatsHeader';
import { ChatItem } from '../components/ChatItem';
import { LoadingView } from '../components/LoadingView';
import { ErrorView } from '../components/ErrorView';
import { EmptyView } from '../components/EmptyView';
import { AnalysisModal } from '../components/AnalysisModal';

type AnalysisType = 'personal' | 'business' | 'qualities' | null;

type Chat = {
  id: number;
  title: string;
  type: string;
  avatar_url?: string;
};

export function ChatsScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { data, isLoading, error, refetch } = useGetChatsQuery();
  const [analyzeChat, { isLoading: isAnalyzing }] = useAnalyzeChatMutation();

  const [modalVisible, setModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [drawerStep, setDrawerStep] = useState<'type' | 'options' | 'result'>(
    'type'
  );
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [selectedType, setSelectedType] = useState<AnalysisType>(null);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const appStateRef = useRef(AppState.currentState);
  const isAppActiveRef = useRef(true);

  useEffect(() => {
    // Configure notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    // Request notification permissions
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Notification permissions not granted');
      }
    };

    requestPermissions();

    // Track app state
    const subscription = AppState.addEventListener(
      'change',
      async (nextAppState) => {
        if (
          appStateRef.current.match(/inactive|background/) &&
          nextAppState === 'active'
        ) {
          // App has come to the foreground
          isAppActiveRef.current = true;

          // Check if there's a pending analysis that might have completed
          const pendingAnalysis = await AsyncStorage.getItem('pendingAnalysis');
          if (pendingAnalysis) {
            // Analysis was in progress when app was backgrounded
            // The request might have completed - we'll handle it in the catch block
            // or the user can check manually
          }
        } else if (nextAppState.match(/inactive|background/)) {
          // App has gone to the background
          isAppActiveRef.current = false;
        }
        appStateRef.current = nextAppState;
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (modalVisible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      slideAnim.setValue(0);
    }
  }, [modalVisible, slideAnim]);

  useEffect(() => {
    if (error && !isLoading) {
      dispatch(logout());
      dispatch(api.util.invalidateTags(['Auth']));
      Toast.show({
        type: 'error',
        text1: 'Session expired',
        text2: 'Please login again',
      });
    }
  }, [error, isLoading, dispatch]);

  const handleAnalyze = (chat: Chat) => {
    setSelectedChat(chat);
    setDrawerStep('type');
    setSelectedType(null);
    setAnalysisResult('');
    setModalVisible(true);
  };

  const closeDrawer = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setSelectedChat(null);
      setSelectedType(null);
      setAnalysisResult('');
      setDrawerStep('type');
    });
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(api.util.invalidateTags(['Auth']));
    dispatch(api.util.resetApiState());

    Toast.show({
      type: 'success',
      text1: 'Logged out',
      text2: 'Session cleared. Please login again',
    });
  };

  const selectAnalysisType = (type: AnalysisType) => {
    setSelectedType(type);
    setDrawerStep('options');
  };

  const goBackToType = () => {
    setDrawerStep('type');
    setSelectedType(null);
  };

  const runAnalysis = async (analysisSubtype: string) => {
    if (!selectedChat) return;

    setDrawerStep('result');
    setAnalysisResult('');

    // Store analysis info for background completion
    const analysisInfo = {
      chatId: selectedChat.id,
      chatTitle: selectedChat.title,
      type: analysisSubtype,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem('pendingAnalysis', JSON.stringify(analysisInfo));

    // Store chat info in ref to access even if component unmounts
    const chatTitle = selectedChat.title;
    const chatId = selectedChat.id;

    try {
      // Start the analysis - this will continue even if app goes to background
      const result = await analyzeChat({
        chatId: selectedChat.id,
        type: analysisSubtype,
      }).unwrap();

      // Clear pending analysis
      await AsyncStorage.removeItem('pendingAnalysis');

      // Check if app is active - only send notification if app is NOT active
      const currentAppState = AppState.currentState;
      const isAppActive = currentAppState === 'active';

      if (!isAppActive) {
        // App is in background or closed - send notification
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Analysis Complete',
            body: `Analysis for "${chatTitle}" is ready`,
            data: { chatId, chatTitle },
          },
          trigger: null, // Send immediately
        });
      } else {
        // App is active - update UI and show toast
        setAnalysisResult(result.analysis);
        Toast.show({
          type: 'success',
          text1: 'Analysis complete',
        });
      }
    } catch (error: any) {
      // Clear pending analysis on error
      await AsyncStorage.removeItem('pendingAnalysis');

      // Only update UI if app is active
      const currentAppState = AppState.currentState;
      if (currentAppState === 'active') {
        setAnalysisResult('Failed to analyze chat. Please try again.');
        Toast.show({
          type: 'error',
          text1: 'Analysis failed',
          text2: 'Failed to analyze chat. Please try again.',
        });
      }
    }
  };

  if (isLoading) {
    return <LoadingView />;
  }

  if (error) {
    return (
      <ErrorView error={error} onRetry={refetch} onLogout={handleLogout} />
    );
  }

  if (!data || data.length === 0) {
    return <EmptyView />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <ChatsHeader onLogout={handleLogout} />
        <FlatList
          data={data}
          keyExtractor={(item, index) =>
            item.id ? `chat-${item.id}-${index}` : `chat-${index}`
          }
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <ChatItem chat={item} onAnalyze={handleAnalyze} />
          )}
        />
      </View>

      <AnalysisModal
        visible={modalVisible}
        selectedChat={selectedChat}
        drawerStep={drawerStep}
        selectedType={selectedType}
        analysisResult={analysisResult}
        isAnalyzing={isAnalyzing}
        slideAnim={slideAnim}
        onClose={closeDrawer}
        onSelectType={selectAnalysisType}
        onBackToType={goBackToType}
        onRunAnalysis={runAnalysis}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  listContent: {
    paddingBottom: 16,
  },
});
