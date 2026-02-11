import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { Image as ExpoImage } from 'expo-image';
import { TypingText } from '../components/TypingText';
import { BackgroundWrapper } from '../components/BackgroundWrapper';
import { BackButton } from '../components/BackButton';
import { Avatar } from '../components/Avatar';
import { ImageAssets } from '../utils/imageCache';
import { useTranslation } from 'react-i18next';
import { processAvatarUrl } from '../utils/avatarUrl';
import { GlassButton } from '../components/GlassButton';

type Chat = {
  id: number;
  title: string;
  type: string;
  avatar_url?: string;
};

type AnalysisResultScreenProps = {
  chat: Chat;
  questionType?: string | null;
  result: string;
  isAnalyzing: boolean;
  animateResult?: boolean;
  onBack: () => void;
  onReanalyze: () => void;
};

export function AnalysisResultScreen({
  chat,
  questionType,
  result,
  isAnalyzing,
  animateResult = true,
  onBack,
  onReanalyze,
}: AnalysisResultScreenProps) {
  const { t } = useTranslation();
  const [isDone, setIsDone] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState<'import' | 'analyzing'>(
    'import',
  );
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const isPersonal =
    chat.type.toLowerCase() === 'private' ||
    chat.type.toLowerCase().includes('личн') ||
    chat.type.toLowerCase().includes('personal');
  const avatarUrl = processAvatarUrl(chat.avatar_url);

  const questionLabel =
    (questionType && t(`analysis.questionLabels.${questionType}`)) ||
    t('analysis.questionLabels.character');

  useEffect(() => {
    if (!isAnalyzing && result) {
      setIsDone(true);
    } else if (isAnalyzing) {
      setIsDone(false);
      setLoadingPhase('import');
    }
  }, [isAnalyzing, result]);

  // After 3 seconds, switch from import phase to analyzing phase
  useEffect(() => {
    if (!isAnalyzing || isDone) return;

    const timer = setTimeout(() => {
      setLoadingPhase('analyzing');
      setLoadingMessageIndex(0);
    }, 3000);

    return () => clearTimeout(timer);
  }, [isAnalyzing, isDone]);

  // Cycle through loading messages every 2-4 seconds in analyzing phase
  useEffect(() => {
    if (!isAnalyzing || isDone || loadingPhase !== 'analyzing') return;

    const loadingMessages = t('analysis.loadingMessages', {
      returnObjects: true,
    }) as string[];
    const messageCount = Array.isArray(loadingMessages)
      ? loadingMessages.length
      : 0;
    if (messageCount === 0) return;

    const minDelay = 2000;
    const maxDelay = 4000;
    const delay = minDelay + Math.random() * (maxDelay - minDelay);

    const timer = setTimeout(() => {
      setLoadingMessageIndex((prev) =>
        prev < messageCount - 1 ? prev + 1 : prev,
      );
    }, delay);

    return () => clearTimeout(timer);
  }, [isAnalyzing, isDone, loadingPhase, loadingMessageIndex, t]);

  const insets = useSafeAreaInsets();

  return (
    <BackgroundWrapper showGlow showHeader={false}>
      <SafeAreaView
        style={styles.safeArea}
        edges={Platform.OS === 'android' ? ['bottom'] : []}
      >
        <View
          style={[
            styles.header,
            { paddingTop: Platform.OS === 'web' ? 24 : insets.top + 24 },
          ]}
        >
          <BackButton onPress={onBack} />
          <View style={styles.headerCenter}>
            <Text style={styles.headerName}>{chat.title}</Text>
            <View style={styles.headerTypeContainer}>
              <ExpoImage
                source={
                  isPersonal
                    ? ImageAssets.privateChatIcon
                    : ImageAssets.groupChatIcon
                }
                style={styles.headerTypeIcon}
                contentFit='contain'
              />
              <Text style={styles.headerType}>
                {isPersonal ? t('chats.personalChat') : t('chats.groupChat')}
              </Text>
            </View>
          </View>
          <View style={styles.headerAvatar}>
            <Avatar name={chat.title} size={40} avatarUrl={avatarUrl} />
          </View>
        </View>

        <ScrollView
          style={styles.bodyScroll}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          {isDone && (
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionHeaderLeft}>
                <Text style={styles.sectionLabelTop}>
                  {t('analysis.whatToStudy')}
                </Text>
                <Text style={styles.sectionValue}>{questionLabel}</Text>
              </View>
            </View>
          )}
          {!isDone ? (
            <View style={styles.loadingContainer}>
              {loadingPhase === 'import' ? (
                <>
                  <ActivityIndicator
                    size='large'
                    color='#34C759'
                    style={styles.loadingSpinner}
                  />
                  <Text style={styles.importSubtitle}>
                    {t('analysis.analyzingSubtitle')}
                  </Text>
                </>
              ) : (
                <View style={styles.analyzingPhaseContainer}>
                  <Text style={styles.inProgressLabel}>
                    {t('analysis.inProgress')}
                  </Text>
                  <TypingText
                    text={
                      (
                        t('analysis.loadingMessages', {
                          returnObjects: true,
                        }) as string[]
                      )?.[loadingMessageIndex] ??
                      t('analysis.analyzingQuestion', { topic: questionLabel })
                    }
                    speed={40}
                    style={styles.analyzingQuestion}
                  />
                </View>
              )}
            </View>
          ) : (
            <View style={styles.resultContainer}>
              <Text style={[styles.sectionLabel, styles.resultSectionLabel]}>
                {t('analysis.analysisResult')}
              </Text>
              {animateResult ? (
                <TypingText text={result} speed={5} style={styles.resultText} />
              ) : (
                <Text style={styles.resultText}>{result}</Text>
              )}
            </View>
          )}
        </ScrollView>
        {isDone && (
          <View style={styles.buttonContainer}>
            {/* <Button title='Начать' onPress={onStart} /> */}
            <GlassButton
              title={t('analysis.startAgain')}
              onPress={onReanalyze}
            />
          </View>
        )}
      </SafeAreaView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
    paddingBottom: 0,
    flexShrink: 0,
  },
  sectionHeaderLeft: {
    flex: 1,
  },
  reanalyzeButton: {
    width: 24,
    height: 24,
    borderRadius: 20,
    // backgroundColor: '#39E478',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
    flexShrink: 0,
  },
  reanalyzeIcon: {
    width: 24,
    height: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 6,
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: 'Onest-SemiBold',
      android: 'Onest-SemiBold',
      web: 'Onest, sans-serif',
    }),
  },
  headerTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTypeIcon: {
    width: 15,
    height: 15,
    marginRight: 4,
  },
  headerType: {
    fontSize: 14,
    color: '#C5C1B9',
    fontFamily: Platform.select({
      ios: 'Onest-Regular',
      android: 'Onest-Regular',
      web: 'Onest, sans-serif',
    }),
  },
  headerAvatar: {
    marginLeft: 12,
  },
  bodyScroll: {
    flex: 1,
  },
  bodyContent: {
    paddingHorizontal: 34,
    paddingBottom: 100,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  loadingSpinner: {
    marginBottom: 24,
  },
  importSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#fff',
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: 'Onest-Regular',
      android: 'Onest-Regular',
      web: 'Onest, sans-serif',
    }),
    lineHeight: 22,
    paddingHorizontal: 24,
  },
  analyzingPhaseContainer: {
    flex: 1,
    alignSelf: 'stretch',
    paddingTop: 0,
  },
  inProgressLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
    fontFamily: Platform.select({
      ios: 'Onest-Regular',
      android: 'Onest-Regular',
      web: 'Onest, sans-serif',
    }),
  },
  analyzingQuestion: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    fontFamily: Platform.select({
      ios: 'Onest-SemiBold',
      android: 'Onest-SemiBold',
      web: 'Onest, sans-serif',
    }),
    lineHeight: 28,
  },
  resultContainer: {
    flex: 1,
  },
  sectionLabelTop: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8C8C8C',
    letterSpacing: 1,
    marginBottom: 8,
    textAlign: 'left',
    fontFamily: Platform.select({
      ios: 'SF Pro Text',
      android: 'SF-Pro',
      web: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
    }),
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F7FDFA',
    opacity: 0.4,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    textAlign: 'left',
    fontFamily: Platform.select({
      ios: 'Onest-Regular',
      android: 'Onest-Regular',
      web: 'Onest, sans-serif',
    }),
  },
  sectionValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 24,
    textAlign: 'left',
    fontFamily: Platform.select({
      ios: 'Onest-SemiBold',
      android: 'Onest-SemiBold',
      web: 'Onest, sans-serif',
    }),
  },
  resultSectionLabel: {
    marginTop: 16,
  },
  resultText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#C5C1B9',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 34,
    paddingBottom: 36,
  },
});
