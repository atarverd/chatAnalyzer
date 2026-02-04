import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
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
import { triggerHaptic } from '../utils/haptics';
import { ChatItem } from '../components/ChatItem';
import { LoadingView } from '../components/LoadingView';
import { ErrorView } from '../components/ErrorView';
import { EmptyView } from '../components/EmptyView';
import { AnalysisOptionsScreen } from './AnalysisOptionsScreen';
import { AnalysisResultScreen } from './AnalysisResultScreen';
import { BackgroundWrapper } from '../components/BackgroundWrapper';
import { ImageAssets } from '../utils/imageCache';
import { useTranslation } from 'react-i18next';

type AnalysisType = 'personal' | 'business' | 'qualities' | null;

type Chat = {
  id: number;
  title: string;
  type: string;
  avatar_url?: string;
};

export function ChatsScreen() {
  const { t } = useTranslation();
  const { data, isLoading, error, refetch } = useGetChatsQuery();
  const [analyzeChat, { isLoading: isAnalyzing }] = useAnalyzeChatMutation();

  const [analysisView, setAnalysisView] = useState<
    'none' | 'options' | 'result'
  >('none');
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [analysisResults, setAnalysisResults] = useState<Map<number, string>>(new Map());
  const [currentQuestionType, setCurrentQuestionType] = useState<string | null>(
    null
  );
  const [currentTone, setCurrentTone] = useState<string>('neutral');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'personal' | 'group'>(
    'all'
  );
  const [chatsWithAnalysis, setChatsWithAnalysis] = useState<Set<number>>(
    new Set()
  );
  const [chatsWithPendingAnalysis, setChatsWithPendingAnalysis] = useState<Set<number>>(
    new Set()
  );
  const [analyzingChatId, setAnalyzingChatId] = useState<number | null>(null);
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

          // Check if there are any pending analyses that might have completed
          // This is handled per-chat when navigating to the result screen
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

  const handleAnalyze = async (chat: Chat) => {
    setSelectedChat(chat);

    try {
      // If there is a pending analysis for this specific chat, go straight to result
      const pending = await AsyncStorage.getItem(`pendingAnalysis:${chat.id}`);
      if (pending) {
        const info = JSON.parse(pending);
        setCurrentQuestionType(info.questionType || info.type || null);
        setCurrentTone(info.tone || 'neutral');
        setAnalysisView('result');
        setAnalyzingChatId(chat.id);
        return;
      }

      // If there is a saved completed analysis for this chat, show it
      const saved = await AsyncStorage.getItem(`analysisResult:${chat.id}`);
      if (saved) {
        const info = JSON.parse(saved);
        setCurrentQuestionType(info.questionType || info.type || null);
        setCurrentTone(info.tone || 'neutral');
        setAnalysisResults((prev) => new Map(prev).set(chat.id, info.analysis || ''));
        setAnalysisView('result');
        setAnalyzingChatId(null);
        return;
      }
    } catch (e) {
      // ignore and fall back to options screen
    }

    setAnalysisView('options');
    setAnalyzingChatId(null);
  };

  const handleBackFromOptions = async () => {
    if (!selectedChat) {
      setAnalysisView('none');
      setSelectedChat(null);
      setAnalyzingChatId(null);
      return;
    }

    // Check if there's a saved analysis for this chat
    try {
      const saved = await AsyncStorage.getItem(`analysisResult:${selectedChat.id}`);
      if (saved) {
        const info = JSON.parse(saved);
        setCurrentQuestionType(info.questionType || info.type || null);
        setCurrentTone(info.tone || 'neutral');
        setAnalysisResults((prev) => new Map(prev).set(selectedChat.id, info.analysis || ''));
        setAnalysisView('result');
        setAnalyzingChatId(null);
        return;
      }
    } catch (e) {
      // ignore and fall back to chats screen
    }

    // No saved analysis, go back to chats screen
    setAnalysisView('none');
    setSelectedChat(null);
    setAnalyzingChatId(null);
  };

  const handleStartAnalysis = (questionType: string, tone: string) => {
    if (!selectedChat) return;

    setCurrentQuestionType(questionType);
    setCurrentTone(tone);
    setAnalysisView('result');
    setAnalysisResults((prev) => {
      const newMap = new Map(prev);
      newMap.set(selectedChat.id, '');
      return newMap;
    });
    setAnalyzingChatId(selectedChat.id);

    // Start the analysis
    runAnalysisWithParams(questionType, tone);
  };

  const runAnalysisWithParams = async (questionType: string, tone: string) => {
    if (!selectedChat) return;

    const chatTitle = selectedChat.title;
    const chatId = selectedChat.id;

    // Store analysis info for background completion (per-chat)
    const analysisInfo = {
      chatId: selectedChat.id,
      chatTitle: selectedChat.title,
      questionType,
      tone,
      timestamp: Date.now(),
    };
      await AsyncStorage.setItem(`pendingAnalysis:${chatId}`, JSON.stringify(analysisInfo));
      setAnalyzingChatId(chatId);
      setChatsWithPendingAnalysis((prev) => new Set(prev).add(chatId));

    try {
      // Start the analysis
      const result = await analyzeChat({
        chatId: selectedChat.id,
        type: questionType,
        tone,
      }).unwrap();

      await AsyncStorage.removeItem(`pendingAnalysis:${chatId}`);
      setAnalyzingChatId(null);
      setChatsWithPendingAnalysis((prev) => {
        const newSet = new Set(prev);
        newSet.delete(chatId);
        return newSet;
      });

      // Save successful result per chat for reuse
      const storedResult = {
        chatId,
        chatTitle,
        questionType,
        tone,
        analysis: result.analysis,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(
        `analysisResult:${chatId}`,
        JSON.stringify(storedResult)
      );
      // Update the set of chats with analysis
      setChatsWithAnalysis((prev) => new Set(prev).add(chatId));

      // Trigger success haptic feedback
      await triggerHaptic('success');

      const currentAppState = AppState.currentState;
      const isAppActive = currentAppState === 'active';

      if (!isAppActive && Platform.OS !== 'web') {
        try {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: t('analysis.notifications.completeTitle'),
              body: t('analysis.notifications.completeBody', { chatTitle }),
              data: { chatId, chatTitle },
            },
            trigger: null,
          });
        } catch (error) {
          // Update result only for this specific chat
          setAnalysisResults((prev) => new Map(prev).set(chatId, result.analysis));
        }
      } else {
        // Update result only for this specific chat
        setAnalysisResults((prev) => new Map(prev).set(chatId, result.analysis));
      }
    } catch (error: any) {
      await AsyncStorage.removeItem(`pendingAnalysis:${chatId}`);
      setAnalyzingChatId(null);
      setChatsWithPendingAnalysis((prev) => {
        const newSet = new Set(prev);
        newSet.delete(chatId);
        return newSet;
      });

      const currentAppState = AppState.currentState;
      if (currentAppState === 'active') {
        // Update error only for this specific chat
        setAnalysisResults((prev) => new Map(prev).set(chatId, t('errors.failedToAnalyze')));
      }
    }
  };

  const handleBackFromResult = () => {
    setAnalysisView('none');
    setSelectedChat(null);
    setCurrentQuestionType(null);
    setAnalyzingChatId(null);
    // Refresh analysis status when returning from result
    checkAnalysisResults();
  };

  // Check which chats have analysis results and pending analyses
  const checkAnalysisResults = async () => {
    if (!data) return;
    const chatIdsWithAnalysis = new Set<number>();
    const chatIdsWithPending = new Set<number>();
    for (const chat of data) {
      const saved = await AsyncStorage.getItem(`analysisResult:${chat.id}`);
      if (saved) {
        chatIdsWithAnalysis.add(chat.id);
      }
      // Check for pending analysis
      const pending = await AsyncStorage.getItem(`pendingAnalysis:${chat.id}`);
      if (pending) {
        chatIdsWithPending.add(chat.id);
      }
    }
    setChatsWithAnalysis(chatIdsWithAnalysis);
    setChatsWithPendingAnalysis(chatIdsWithPending);
  };

  // Check for analysis results when chats data changes
  useEffect(() => {
    if (data) {
      checkAnalysisResults();
    }
  }, [data]);

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
  if (analysisView === 'options' && selectedChat) {
    return (
      <AnalysisOptionsScreen
        chat={selectedChat}
        onBack={handleBackFromOptions}
        onStartAnalysis={handleStartAnalysis}
      />
    );
  }

  // Show analysis result screen
  if (analysisView === 'result' && selectedChat) {
    // Only show loading if this specific chat is being analyzed
    const isThisChatAnalyzing = analyzingChatId === selectedChat.id && isAnalyzing;
    // Get result only for this specific chat
    const chatResult = analysisResults.get(selectedChat.id) || '';
    return (
      <AnalysisResultScreen
        chat={selectedChat}
        questionType={currentQuestionType}
        result={chatResult}
        isAnalyzing={isThisChatAnalyzing}
        onBack={handleBackFromResult}
        onReanalyze={() => {
          setAnalysisView('options');
        }}
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
      (filterType === 'personal' &&
        (chat.type.toLowerCase() === 'private' ||
          chat.type.toLowerCase().includes('личн') ||
          chat.type.toLowerCase().includes('personal'))) ||
      (filterType === 'group' &&
        (chat.type.toLowerCase().includes('групп') ||
          chat.type.toLowerCase().includes('group')));
    return matchesSearch && matchesFilter;
  });

  return (
    <BackgroundWrapper showGlow showHeader>
      <SafeAreaView
        style={styles.safeArea}
        edges={Platform.OS === 'android' ? ['bottom'] : []}
      >
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
                  <Text style={styles.searchPlaceholderText}>
                    {t('common.search')}
                  </Text>
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
                  {t('chats.all')}
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
                  {t('chats.personal')}
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
                  {t('chats.group')}
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
                  <ChatItem
                    chat={item}
                    onAnalyze={handleAnalyze}
                    hasAnalysis={chatsWithAnalysis.has(item.id)}
                    isPending={chatsWithPendingAnalysis.has(item.id)}
                  />
                )}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
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
    // width: 354,
    width:Platform.OS === 'web' ?'-webkit-fill-available' : 'unset',
    height: 44,
    borderRadius: 296,
    paddingLeft: 11,
    paddingRight: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 12,
    marginHorizontal: 24,
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
      android: 'SF-Pro',
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
      android: 'SF-Pro',
      web: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
    }),
    lineHeight: 17,
    letterSpacing: 0,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  filterContainer: {
    flexDirection: 'row',
    // width: 354,
    width:Platform.OS === 'web' ?'-webkit-fill-available' : 'unset',
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
    // marginBottom: 30,
    marginHorizontal: 24,
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
      android: 'SF-Pro',
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
    // marginTop: 24,
  },
  listContent: {
    paddingBottom: 0,
    paddingTop: 24,
  },
});
