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
  Alert,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {
  useGetChatsQuery,
  useLazyGetAnalyzePossibleQuery,
  useAnalyzeChatMutation,
  useCaptureMetricMutation,
  useLogoutMutation,
  api,
  type AnalysisBlock,
} from '../services/api';
import { AnalyticsMetric, getOptionMetric } from '../types/analytics';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { triggerHaptic } from '../utils/haptics';
import { ChatItem } from '../components/ChatItem';
import { LoadingView } from '../components/LoadingView';
import { ErrorView } from '../components/ErrorView';
import { EmptyView } from '../components/EmptyView';
import { AnalysisOptionsScreen } from './AnalysisOptionsScreen';
import { AnalysisResultScreen } from './AnalysisResultScreen';
import { NotEnoughDataScreen } from './NotEnoughDataScreen';
import { BackgroundWrapper } from '../components/BackgroundWrapper';
import { ChatsMenuDropdown } from '../components/ChatsMenuDropdown';
import { ImageAssets } from '../utils/imageCache';
import { colors } from '../theme/colors';
import { useTranslation } from 'react-i18next';
import { getApiErrorMessage } from '../utils/apiErrorMap';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../store';
import { logout } from '../features/auth/authSlice';

type AnalysisType = 'personal' | 'business' | 'qualities' | null;

type Chat = {
  id: number;
  title: string;
  type: string;
  avatar_url?: string;
};

type ChatsScreenProps = {
  onShowHowItWorks?: () => void;
  onAnalysisOptionsOrResultActive?: (active: boolean) => void;
};

// Persists across Strict Mode unmount/remount to prevent duplicate analytics
let chatsScreenSeenFired = false;

export function ChatsScreen({
  onShowHowItWorks,
  onAnalysisOptionsOrResultActive,
}: ChatsScreenProps) {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch<AppDispatch>();
  const { data, isLoading, error, refetch } = useGetChatsQuery();
  const [getAnalyzePossible] = useLazyGetAnalyzePossibleQuery();
  const [analyzeChat, { isLoading: isAnalyzing }] = useAnalyzeChatMutation();
  const [captureMetric] = useCaptureMetricMutation();
  const [logoutMutation] = useLogoutMutation();

  const trackMetric = (metric: AnalyticsMetric) => {
    captureMetric({ metric, device: Platform.OS }).catch(() => {});
  };
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    if (chatsScreenSeenFired) return;
    chatsScreenSeenFired = true;

    const run = async () => {
      try {
        const sent = await AsyncStorage.getItem('firstTimeChatsScreenSeenSent');
        if (sent === 'true') {
          trackMetric(AnalyticsMetric.TELEGRAM_CHATS_SEEN);
        } else {
          trackMetric(AnalyticsMetric.FIRST_TIME_CHATS_SCREEN_SEEN);
          await AsyncStorage.setItem('firstTimeChatsScreenSeenSent', 'true');
        }
      } catch {
        trackMetric(AnalyticsMetric.TELEGRAM_CHATS_SEEN);
      }
    };
    run();
  }, []);

  const [analysisView, setAnalysisView] = useState<
    'none' | 'options' | 'result' | 'notEnough'
  >('none');

  useEffect(() => {
    onAnalysisOptionsOrResultActive?.(
      analysisView === 'options' || analysisView === 'result',
    );
    return () => onAnalysisOptionsOrResultActive?.(false);
  }, [analysisView, onAnalysisOptionsOrResultActive]);
  const [chatsWithNotEnoughData, setChatsWithNotEnoughData] = useState<
    Set<number>
  >(new Set());
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [analysisResults, setAnalysisResults] = useState<
    Map<number, string | AnalysisBlock[]>
  >(new Map());
  const [currentQuestionType, setCurrentQuestionType] = useState<string | null>(
    null,
  );
  const [currentTone, setCurrentTone] = useState<string>('neutral');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInputFocused, setSearchInputFocused] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'personal' | 'group'>(
    'all',
  );
  const [chatsWithAnalysis, setChatsWithAnalysis] = useState<Set<number>>(
    new Set(),
  );
  const [chatAnalysisTimestamps, setChatAnalysisTimestamps] = useState<
    Map<number, number>
  >(new Map());
  const [chatsWithPendingAnalysis, setChatsWithPendingAnalysis] = useState<
    Set<number>
  >(new Set());
  const [analyzingChatId, setAnalyzingChatId] = useState<number | null>(null);
  const [isExistingAnalysisResult, setIsExistingAnalysisResult] =
    useState(false);
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
      },
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
        setIsExistingAnalysisResult(false);
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
        setAnalysisResults((prev) =>
          new Map(prev).set(chat.id, info.blocks ?? info.analysis ?? ''),
        );
        setIsExistingAnalysisResult(true);
        setAnalysisView('result');
        setAnalyzingChatId(null);
        return;
      }
    } catch (e) {
      // ignore and fall back to options screen
    }

    setAnalysisView('options');
    setAnalyzingChatId(null);
    trackMetric(AnalyticsMetric.TELEGRAM_CHAT_SELECTED);
  };

  const handleBackFromNotEnough = () => {
    setAnalysisView('none');
    setSelectedChat(null);
    setAnalyzingChatId(null);
  };

  const handleBackFromOptions = () => {
    setAnalysisView('none');
    setSelectedChat(null);
    setAnalyzingChatId(null);
  };

  const handleStartAnalysis = async (questionType: string, tone: string) => {
    if (!selectedChat) return;

    // Check if analysis is possible before starting
    try {
      const result = await getAnalyzePossible(selectedChat.id);
      if (result.error) {
        const msg = getApiErrorMessage(
          result.error as { data?: { code?: string; error?: string } },
          t,
          'errors.generic',
        );
        Alert.alert(t('errors.generic'), msg);
        return;
      }
      if (result.data?.possible === false) {
        setChatsWithNotEnoughData((prev) => {
          const next = new Set(prev).add(selectedChat.id);
          persistNotEnoughData(next);
          return next;
        });
        setAnalysisView('notEnough');
        setAnalyzingChatId(null);
        return;
      }
      if (result.data?.possible === true) {
        setChatsWithNotEnoughData((prev) => {
          const next = new Set(prev);
          next.delete(selectedChat.id);
          persistNotEnoughData(next);
          return next;
        });
      }
    } catch (err: any) {
      const msg = getApiErrorMessage(err, t, 'errors.generic');
      Alert.alert(t('errors.generic'), msg);
      return;
    }

    setCurrentQuestionType(questionType);
    setCurrentTone(tone);
    setIsExistingAnalysisResult(false);
    setAnalysisView('result');
    setAnalysisResults((prev) => {
      const newMap = new Map(prev);
      newMap.set(selectedChat.id, '');
      return newMap;
    });
    setAnalyzingChatId(selectedChat.id);

    const optionMetric = getOptionMetric(questionType);
    if (optionMetric) trackMetric(optionMetric);

    // Start the analysis
    runAnalysisWithParams(questionType, tone);
  };

  const runAnalysisWithParams = async (questionType: string, tone: string) => {
    if (!selectedChat) return;

    trackMetric(AnalyticsMetric.CHAT_ANALYSIS_STARTED);

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
    await AsyncStorage.setItem(
      `pendingAnalysis:${chatId}`,
      JSON.stringify(analysisInfo),
    );
    setAnalyzingChatId(chatId);
    setChatsWithPendingAnalysis((prev) => new Set(prev).add(chatId));

    try {
      // Start the analysis
      const result = await analyzeChat({
        chatId: selectedChat.id,
        type: questionType,
        tone,
        language: i18n.language,
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
        blocks: result.blocks,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(
        `analysisResult:${chatId}`,
        JSON.stringify(storedResult),
      );
      // Update the set of chats with analysis and timestamp; remove from not-enough
      setChatsWithAnalysis((prev) => new Set(prev).add(chatId));
      setChatsWithNotEnoughData((prev) => {
        const next = new Set(prev);
        next.delete(chatId);
        persistNotEnoughData(next);
        return next;
      });
      setChatAnalysisTimestamps((prev) =>
        new Map(prev).set(chatId, Date.now()),
      );

      trackMetric(AnalyticsMetric.CHAT_ANALYSIS_COMPLETED);

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
          setAnalysisResults((prev) =>
            new Map(prev).set(chatId, result.blocks ?? result.analysis ?? ''),
          );
        }
      } else {
        // Update result only for this specific chat
        setAnalysisResults((prev) =>
          new Map(prev).set(chatId, result.blocks ?? result.analysis ?? ''),
        );
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
        const msg = getApiErrorMessage(error, t, 'errors.failedToAnalyze');
        setAnalysisResults((prev) => new Map(prev).set(chatId, msg));
      }
    }
  };

  const handleBackFromResult = () => {
    setAnalysisView('none');
    setSelectedChat(null);
    setCurrentQuestionType(null);
    setAnalyzingChatId(null);
    checkAnalysisResults();
  };

  const handleReanalyze = async () => {
    if (!selectedChat) return;
    trackMetric(AnalyticsMetric.CHAT_ANALYSIS_REANALYZED);
    try {
      await AsyncStorage.removeItem(`analysisResult:${selectedChat.id}`);
    } catch {
      // ignore
    }
    setAnalysisResults((prev) => {
      const next = new Map(prev);
      next.delete(selectedChat.id);
      return next;
    });
    setChatsWithAnalysis((prev) => {
      const next = new Set(prev);
      next.delete(selectedChat.id);
      return next;
    });
    setChatAnalysisTimestamps((prev) => {
      const next = new Map(prev);
      next.delete(selectedChat.id);
      return next;
    });
    setIsExistingAnalysisResult(false);
    setAnalysisView('options');
  };

  const persistNotEnoughData = async (ids: Set<number>) => {
    try {
      await AsyncStorage.setItem(
        'chatsWithNotEnoughData',
        JSON.stringify([...ids]),
      );
    } catch {
      // ignore
    }
  };

  // Check which chats have analysis results and pending analyses
  const checkAnalysisResults = async () => {
    if (!data) return;
    const chatIdsWithAnalysis = new Set<number>();
    const timestamps = new Map<number, number>();
    const chatIdsWithPending = new Set<number>();
    const chatIdsWithNotEnough = new Set<number>();

    for (const chat of data) {
      const saved = await AsyncStorage.getItem(`analysisResult:${chat.id}`);
      if (saved) {
        try {
          const info = JSON.parse(saved);
          chatIdsWithAnalysis.add(chat.id);
          if (info.timestamp != null) {
            timestamps.set(chat.id, info.timestamp);
          }
        } catch {
          chatIdsWithAnalysis.add(chat.id);
        }
      }
      // Check for pending analysis
      const pending = await AsyncStorage.getItem(`pendingAnalysis:${chat.id}`);
      if (pending) {
        chatIdsWithPending.add(chat.id);
      }
    }

    // Load persisted "not enough" chat IDs (exclude chats that now have analysis)
    try {
      const stored = await AsyncStorage.getItem('chatsWithNotEnoughData');
      if (stored) {
        const ids = JSON.parse(stored) as number[];
        for (const id of ids) {
          if (!chatIdsWithAnalysis.has(id)) {
            chatIdsWithNotEnough.add(id);
          }
        }
      }
    } catch {
      // ignore
    }

    setChatsWithAnalysis(chatIdsWithAnalysis);
    setChatAnalysisTimestamps(timestamps);
    setChatsWithPendingAnalysis(chatIdsWithPending);
    setChatsWithNotEnoughData(chatIdsWithNotEnough);
  };

  // Check for analysis results when chats data changes
  useEffect(() => {
    if (data) {
      checkAnalysisResults();
    }
  }, [data]);

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch {
    } finally {
      dispatch(logout());
      dispatch(api.util.resetApiState());
    }
  };

  if (isLoading) {
    return <LoadingView />;
  }

  if (error) {
    return <ErrorView error={error} onRetry={refetch} />;
  }

  if (!data || data.length === 0) {
    return (
      <BackgroundWrapper
        showGlow
        showHeader
        showMenuButton
        headerLogoPadding={false}
        onMenuPress={() => setMenuVisible(true)}
      >
        <ChatsMenuDropdown
          visible={menuVisible}
          onClose={() => setMenuVisible(false)}
          onRefresh={() => refetch()}
          onHowItWorks={() => {
            setMenuVisible(false);
            onShowHowItWorks?.();
          }}
          onLogout={handleLogout}
          anchorTop={Platform.OS === 'web' ? 60 : insets.top + 24 + 36}
        />
        <SafeAreaView
          style={styles.safeArea}
          edges={Platform.OS === 'android' ? ['bottom'] : []}
        >
          <EmptyView embedded />
        </SafeAreaView>
      </BackgroundWrapper>
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

  const showAnalysisOverlay =
    analysisView !== 'none' &&
    (analysisView === 'options' ||
      analysisView === 'notEnough' ||
      analysisView === 'result') &&
    selectedChat;

  return (
    <BackgroundWrapper
      showGlow
      showHeader
      showMenuButton
      headerLogoPadding={false}
      onMenuPress={() => setMenuVisible(true)}
    >
      <ChatsMenuDropdown
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onRefresh={() => refetch()}
        onHowItWorks={() => {
          setMenuVisible(false);
          onShowHowItWorks?.();
        }}
        onLogout={handleLogout}
        anchorTop={Platform.OS === 'web' ? 60 : insets.top + 24 + 36}
      />
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
                onFocus={() => setSearchInputFocused(true)}
                onBlur={() => setSearchInputFocused(false)}
                selectionColor={colors.blue}
                {...(Platform.OS === 'web' && {
                  outlineStyle: 'none' as any,
                  caretColor: colors.blue,
                })}
              />
              {!searchQuery && !searchInputFocused && (
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

            {/* <View style={styles.filterContainer}>
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
            </View> */}

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
                    analysisTimestamp={chatAnalysisTimestamps.get(item.id)}
                    isPending={chatsWithPendingAnalysis.has(item.id)}
                    hasNotEnoughData={chatsWithNotEnoughData.has(item.id)}
                  />
                )}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </SafeAreaView>
      {showAnalysisOverlay && (
        <View style={styles.analysisOverlay}>
          <ExpoImage
            source={ImageAssets.bgTop}
            style={styles.analysisOverlayBg}
            contentFit='contain'
            contentPosition='top'
          />
          <BackgroundWrapper
            showGlow
            showHeader={false}
            style={styles.analysisOverlayContent}
          >
            {analysisView === 'options' && (
              <AnalysisOptionsScreen
                chat={selectedChat}
                onBack={handleBackFromOptions}
                onStartAnalysis={handleStartAnalysis}
              />
            )}
            {analysisView === 'notEnough' && (
              <NotEnoughDataScreen
                chat={selectedChat}
                onBack={handleBackFromNotEnough}
              />
            )}
            {analysisView === 'result' && (
              <AnalysisResultScreen
                chat={selectedChat}
                questionType={currentQuestionType}
                result={analysisResults.get(selectedChat.id) || ''}
                isAnalyzing={analyzingChatId === selectedChat.id && isAnalyzing}
                onBack={handleBackFromResult}
                onReanalyze={handleReanalyze}
              />
            )}
          </BackgroundWrapper>
        </View>
      )}
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  analysisOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    backgroundColor: colors.background,
  },
  analysisOverlayBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: '40%',
    zIndex: 0,
  },
  analysisOverlayContent: {
    flex: 1,
    zIndex: 1,
  },
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
    width: Platform.OS === 'web' ? '-webkit-fill-available' : 'unset',
    height: 44,
    borderRadius: 296,
    paddingLeft: 11,
    paddingRight: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    // marginBottom: 12,
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
      caretColor: colors.blue,
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
    width: Platform.OS === 'web' ? '-webkit-fill-available' : 'unset',
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
    // paddingTop: 24,
  },
});
