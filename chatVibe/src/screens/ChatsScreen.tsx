import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Animated,
  AppState,
  Platform,
  TextInput,
  TouchableOpacity,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGetChatsQuery, useAnalyzeChatMutation, api } from '../services/api';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChatItem } from '../components/ChatItem';
import { LoadingView } from '../components/LoadingView';
import { ErrorView } from '../components/ErrorView';
import { EmptyView } from '../components/EmptyView';
import { AnalysisModal } from '../components/AnalysisModal';
import { AnalysisOptionsScreen } from './AnalysisOptionsScreen';
import { BackgroundWrapper } from '../components/BackgroundWrapper';
import { ImageAssets } from '../utils/imageCache';

type AnalysisType = 'personal' | 'business' | 'qualities' | null;

type Chat = {
  id: number;
  title: string;
  type: string;
  avatar_url?: string;
};

export function ChatsScreen() {
  const { data, isLoading, error, refetch } = useGetChatsQuery();
  const [analyzeChat, { isLoading: isAnalyzing }] = useAnalyzeChatMutation();

  const [modalVisible, setModalVisible] = useState(false);
  const [showAnalysisOptions, setShowAnalysisOptions] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [drawerStep, setDrawerStep] = useState<'type' | 'options' | 'result'>(
    'type'
  );
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [selectedType, setSelectedType] = useState<AnalysisType>(null);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'personal' | 'group'>(
    'all'
  );
  const appStateRef = useRef(AppState.currentState);
  const isAppActiveRef = useRef(true);

  useEffect(() => {
    // Configure notification handler (only on native platforms)
    if (Platform.OS !== 'web') {
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
        try {
          const { status } = await Notifications.requestPermissionsAsync();
          if (status !== 'granted') {
            console.log('Notification permissions not granted');
          }
        } catch (error) {
          console.log('Notification permissions error:', error);
        }
      };

      requestPermissions();
    }

    // Track app state (works on web too, but behaves differently)
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

  const handleAnalyze = (chat: Chat) => {
    setSelectedChat(chat);
    setShowAnalysisOptions(true);
  };

  const handleBackFromOptions = () => {
    setShowAnalysisOptions(false);
    setSelectedChat(null);
  };

  const handleStartAnalysis = (questionType: string, tone: string) => {
    if (!selectedChat) return;

    // Close options screen and open result modal
    setShowAnalysisOptions(false);
    setDrawerStep('result');
    setAnalysisResult('');
    setModalVisible(true);

    // Start the analysis
    runAnalysisWithParams(questionType, tone);
  };

  const runAnalysisWithParams = async (questionType: string, tone: string) => {
    if (!selectedChat) return;

    // Store analysis info for background completion
    const analysisInfo = {
      chatId: selectedChat.id,
      chatTitle: selectedChat.title,
      questionType,
      tone,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem('pendingAnalysis', JSON.stringify(analysisInfo));

    const chatTitle = selectedChat.title;
    const chatId = selectedChat.id;

    try {
      // Start the analysis
      const result = await analyzeChat({
        chatId: selectedChat.id,
        type: questionType,
        tone,
      }).unwrap();

      await AsyncStorage.removeItem('pendingAnalysis');

      const currentAppState = AppState.currentState;
      const isAppActive = currentAppState === 'active';

      if (!isAppActive && Platform.OS !== 'web') {
        try {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Analysis Complete',
              body: `Analysis for "${chatTitle}" is ready`,
              data: { chatId, chatTitle },
            },
            trigger: null,
          });
        } catch (error) {
          setAnalysisResult(result.analysis);
        }
      } else {
        setAnalysisResult(result.analysis);
      }
    } catch (error: any) {
      await AsyncStorage.removeItem('pendingAnalysis');

      const currentAppState = AppState.currentState;
      if (currentAppState === 'active') {
        setAnalysisResult('Failed to analyze chat. Please try again.');
      }
    }
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

      if (!isAppActive && Platform.OS !== 'web') {
        // App is in background or closed - send notification (native only)
        try {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Analysis Complete',
              body: `Analysis for "${chatTitle}" is ready`,
              data: { chatId, chatTitle },
            },
            trigger: null, // Send immediately
          });
        } catch (error) {
          setAnalysisResult(result.analysis);
        }
      } else {
        setAnalysisResult(result.analysis);
      }
    } catch (error: any) {
      // Clear pending analysis on error
      await AsyncStorage.removeItem('pendingAnalysis');

      // Only update UI if app is active
      const currentAppState = AppState.currentState;
      if (currentAppState === 'active') {
        setAnalysisResult('Failed to analyze chat. Please try again.');
      }
    }
  };

  if (isLoading) {
    return <LoadingView />;
  }

  if (error) {
    return <ErrorView error={error} onRetry={refetch} />;
  }

  if (!data || data.length === 0) {
    return <EmptyView />;
  }

  // Show analysis options screen if selected
  if (showAnalysisOptions && selectedChat) {
    return (
      <AnalysisOptionsScreen
        chat={selectedChat}
        onBack={handleBackFromOptions}
        onStartAnalysis={handleStartAnalysis}
      />
    );
  }

  // Filter chats based on search and filter type
  const filteredData = data.filter((chat) => {
    const matchesSearch = chat.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterType === 'all' ||
      (filterType === 'personal' && chat.type.toLowerCase().includes('личн')) ||
      (filterType === 'group' && chat.type.toLowerCase().includes('групп'));
    return matchesSearch && matchesFilter;
  });

  return (
    <BackgroundWrapper showGlow showHeader>
      <SafeAreaView style={styles.safeArea} edges={[]}>
        <TouchableWithoutFeedback
          onPress={Keyboard.dismiss}
          accessible={false}
          disabled={Platform.OS === 'web'}
        >
          <View style={styles.container}>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder=''
                value={searchQuery}
                onChangeText={setSearchQuery}
                {...(Platform.OS === 'web' && {
                  outlineStyle: 'none' as any,
                })}
              />
              {!searchQuery && (
                <View
                  style={styles.searchPlaceholderContainer}
                  pointerEvents='none'
                >
                  <ExpoImage
                    source={ImageAssets.searchIcon}
                    style={styles.searchIcon}
                    contentFit='contain'
                  />
                  <Text style={styles.searchPlaceholderText}>Search</Text>
                </View>
              )}
            </View>

            <View style={styles.filterContainer}>
              <TouchableOpacity
                style={[
                  styles.filterSegment,
                  filterType === 'all' && styles.filterSegmentActive,
                  filterType === 'all' && styles.filterSegmentFirst,
                ]}
                onPress={() => setFilterType('all')}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    filterType === 'all' && styles.filterButtonTextActive,
                  ]}
                >
                  Все
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterSegment,
                  filterType === 'personal' && styles.filterSegmentActive,
                ]}
                onPress={() => setFilterType('personal')}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    filterType === 'personal' && styles.filterButtonTextActive,
                  ]}
                >
                  Личные
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterSegment,
                  filterType === 'group' && styles.filterSegmentActive,
                  filterType === 'group' && styles.filterSegmentLast,
                ]}
                onPress={() => setFilterType('group')}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    filterType === 'group' && styles.filterButtonTextActive,
                  ]}
                >
                  Групповые
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.listContainer}>
              <FlatList
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                data={filteredData}
                keyExtractor={(item, index) =>
                  item.id ? `chat-${item.id}-${index}` : `chat-${index}`
                }
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                  <ChatItem chat={item} onAnalyze={handleAnalyze} />
                )}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>

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
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: 0,
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 354,
    height: 44,
    borderRadius: 296,
    paddingLeft: 11,
    paddingRight: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 12,
    position: 'relative',
  },
  searchInput: {
    flex: 1,
    fontSize: 17,
    fontWeight: '500',
    color: '#fff',
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: 'SF Pro Text',
      android: 'sans-serif-medium',
      web: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
    }),
    lineHeight: 17,
    letterSpacing: 0,
    ...(Platform.OS === 'web' && {
      outlineStyle: 'none' as any,
    }),
  },
  searchPlaceholderContainer: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  searchIcon: {
    width: 18,
    height: 18,
    marginRight: 8,
    alignSelf: 'center',
  },
  searchPlaceholderText: {
    fontSize: 17,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.5)',
    fontFamily: Platform.select({
      ios: 'SF Pro Text',
      android: 'sans-serif-medium',
      web: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
    }),
    lineHeight: 17,
    letterSpacing: 0,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  filterContainer: {
    flexDirection: 'row',
    width: 354,
    height: 36,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(60, 60, 67, 0.6)',
    backgroundColor: 'rgba(118, 118, 128, 0.12)',
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 4,
    paddingRight: 4,
    gap: 2,
    marginBottom: 30,
  },
  filterSegment: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
  },
  filterSegmentActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterSegmentFirst: {
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },
  filterSegmentLast: {
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: Platform.select({
      ios: 'SF Pro Text',
      android: 'sans-serif-medium',
      web: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
    }),
    lineHeight: 18,
    letterSpacing: -0.08,
    textAlign: 'center',
  },
  filterButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  listContainer: {
    width: '100%',
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 0,
  },
  listContent: {
    paddingBottom: 0,
  },
});
