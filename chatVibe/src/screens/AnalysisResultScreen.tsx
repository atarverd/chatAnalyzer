import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
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
import { LinearGradient } from 'expo-linear-gradient';
import Markdown from 'react-native-markdown-display';
import { triggerHaptic } from '../utils/haptics';
import type { AnalysisBlock } from '../services/api';

const fontFamily = Platform.select({
  ios: 'Onest-Regular',
  android: 'Onest-Regular',
  web: 'Onest, sans-serif',
});

const markdownResultStyles = {
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: '#C5C1B9',
    fontFamily,
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 8,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    color: '#C5C1B9',
    fontFamily,
  },
  strong: {
    color: '#C5C1B9',
    fontWeight: '600' as const,
    fontFamily,
  },
  em: {
    color: '#C5C1B9',
    fontStyle: 'italic' as const,
    fontFamily,
  },
  link: {
    color: '#34C759',
    fontFamily,
  },
  bullet_list: { marginBottom: 8 },
  ordered_list: { marginBottom: 8 },
  list_item: { marginBottom: 4 },
  code_inline: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: '#C5C1B9',
    paddingHorizontal: 4,
    borderRadius: 4,
    fontFamily,
  },
  code_block: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    color: '#C5C1B9',
    padding: 12,
    borderRadius: 8,
    fontFamily,
  },
};

const markdownRecommendationStyles = {
  ...markdownResultStyles,
  body: { ...markdownResultStyles.body, color: '#FFFFFF' },
  text: { ...markdownResultStyles.text, color: '#FFFFFF' },
  strong: { ...markdownResultStyles.strong, color: '#FFFFFF' },
  em: { ...markdownResultStyles.em, color: '#FFFFFF' },
  code_inline: { ...markdownResultStyles.code_inline, color: '#FFFFFF' },
  code_block: { ...markdownResultStyles.code_block, color: '#FFFFFF' },
};

type Chat = {
  id: number;
  title: string;
  type: string;
  avatar_url?: string;
};

type AnalysisResultScreenProps = {
  chat: Chat;
  questionType?: string | null;
  result: string | AnalysisBlock[];
  isAnalyzing: boolean;
  onBack: () => void;
  onReanalyze: () => void;
};

export function AnalysisResultScreen({
  chat,
  questionType,
  result,
  isAnalyzing,
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
    t('analysis.questionLabels.communication_character');

  const isBlocks =
    Array.isArray(result) &&
    result.length > 0 &&
    typeof result[0] === 'object' &&
    'type' in result[0];
  const mainBlocks = isBlocks
    ? (result as AnalysisBlock[]).filter((b) => b.type === 'main_block')
    : [];
  const secondaryBlocks = isBlocks
    ? (result as AnalysisBlock[]).filter((b) => b.type === 'secondary_block')
    : [];
  const recommendationBlocks = isBlocks
    ? (result as AnalysisBlock[]).filter(
        (b) => b.type === 'recommendations_block',
      )
    : [];
  const answerVariantBlocks = isBlocks
    ? (result as AnalysisBlock[]).filter((b) => b.type === 'answer_variants')
    : [];

  const parseAnswerVariants = (text: string): string[] => {
    try {
      const parsed = JSON.parse(text);
      return Array.isArray(parsed) ? parsed : [String(parsed)];
    } catch {
      return [text];
    }
  };

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
          ) : isBlocks ? (
            <View style={styles.resultContainer}>
              <Text style={[styles.sectionLabel, styles.resultSectionLabel]}>
                {t('analysis.analysisResult')}
              </Text>
              {mainBlocks.map((block, i) => (
                <View key={`main-${i}`} style={styles.blockCard}>
                  <View style={styles.blockHeaderRow}>
                    <ExpoImage
                      source={ImageAssets.chatOverlay}
                      style={styles.mainBlockIcon}
                      contentFit='contain'
                    />
                    <Text style={styles.blockHeader}>{block.header}</Text>
                  </View>
                  <Markdown style={markdownResultStyles}>{block.text}</Markdown>
                </View>
              ))}
              {secondaryBlocks.map((block, i) => (
                <View key={`sec-${i}`} style={styles.blockCard}>
                  <View style={styles.blockHeaderRow}>
                    <ExpoImage
                      source={ImageAssets.sparkIcon}
                      style={styles.secondaryBlockIcon}
                      contentFit='contain'
                    />
                    <Text style={styles.blockHeader}>{block.header}</Text>
                  </View>
                  <Markdown style={markdownResultStyles}>{block.text}</Markdown>
                </View>
              ))}
              {recommendationBlocks.length > 0 && (
                <LinearGradient
                  colors={['rgba(170, 224, 183, 0.3)', 'rgba(87, 94, 89, 0.3)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={styles.recommendationsBorder}
                >
                  <View style={styles.recommendationsContainer}>
                    {/* <Text style={styles.recommendationsHeader}>
                      {t('analysis.recommendations')}
                    </Text> */}
                    {recommendationBlocks.map((block, i) => (
                      <View key={`rec-${i}`}>
                        {block.header && (
                          <Text style={styles.recommendationBlockHeader}>
                            {block.header}
                          </Text>
                        )}
                        <Markdown style={markdownRecommendationStyles}>
                          {block.text}
                        </Markdown>
                      </View>
                    ))}
                  </View>
                </LinearGradient>
              )}
              {answerVariantBlocks.map((block, blockIdx) => {
                const variants = parseAnswerVariants(block.text);
                if (variants.length === 0) return null;
                return (
                  <View
                    key={`answer-variants-${blockIdx}`}
                    style={styles.answerVariantsSection}
                  >
                    <Text style={styles.answerVariantsTitle}>
                      {t('analysis.answerVariants')}
                    </Text>
                    {variants.map((variantText, idx) => (
                      <View key={idx} style={styles.answerVariantCard}>
                        <View style={styles.answerVariantCardHeader}>
                          <Text style={styles.answerVariantCardTitle}>
                            {t('analysis.variantN', { n: idx + 1 })}
                          </Text>
                          <TouchableOpacity
                            style={styles.copyButton}
                            onPress={async () => {
                              await Clipboard.setStringAsync(variantText);
                              await triggerHaptic('success');
                            }}
                            hitSlop={{
                              top: 12,
                              bottom: 12,
                              left: 12,
                              right: 12,
                            }}
                          >
                            <ExpoImage
                              source={ImageAssets.copyIcon}
                              style={styles.copyIcon}
                              contentFit='contain'
                            />
                          </TouchableOpacity>
                        </View>
                        <Text style={styles.answerVariantCardText}>
                          {variantText}
                        </Text>
                      </View>
                    ))}
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.resultContainer}>
              <Text style={[styles.sectionLabel, styles.resultSectionLabel]}>
                {t('analysis.analysisResult')}
              </Text>
              <Markdown style={markdownResultStyles}>
                {result as string}
              </Markdown>
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
    fontSize: 18,
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
    fontSize: 15,
    lineHeight: 22,
    color: '#C5C1B9',
    fontFamily: Platform.select({
      ios: 'Onest-Regular',
      android: 'Onest-Regular',
      web: 'Onest, sans-serif',
    }),
  },
  blockCard: {
    marginBottom: 24,
  },
  blockHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  mainBlockIcon: {
    width: 40,
    height: 40,
  },
  secondaryBlockIcon: {
    width: 40,
    height: 40,
  },
  blockHeader: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: '#F7FDFA',
    fontFamily: Platform.select({
      ios: 'Onest-Regular',
      android: 'Onest-Regular',
      web: 'Onest, sans-serif',
    }),
  },
  recommendationsBorder: {
    marginTop: 8,
    marginBottom: 24,
    borderRadius: 16,
    padding: 1,
    overflow: 'hidden',
  },
  recommendationsContainer: {
    padding: 20,
    borderRadius: 15,
    backgroundColor: '#141715',
  },
  recommendationsHeader: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#F7FDFA',
    marginBottom: 16,
    fontFamily: Platform.select({
      ios: 'Onest-SemiBold',
      android: 'Onest-SemiBold',
      web: 'Onest, sans-serif',
    }),
  },
  recommendationBlockHeader: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#F7FDFA66',
    marginBottom: 8,
    fontFamily: Platform.select({
      ios: 'Onest-SemiBold',
      android: 'Onest-SemiBold',
      web: 'Onest, sans-serif',
    }),
  },
  recommendationText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#FFFFFF',
    marginBottom: 12,
    fontFamily: Platform.select({
      ios: 'Onest-Regular',
      android: 'Onest-Regular',
      web: 'Onest, sans-serif',
    }),
  },
  answerVariantsSection: {
    marginTop: 24,
    marginBottom: 24,
  },
  answerVariantsTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#F7FDFA',
    marginBottom: 16,
    fontFamily: Platform.select({
      ios: 'Onest-SemiBold',
      android: 'Onest-SemiBold',
      web: 'Onest, sans-serif',
    }),
  },
  answerVariantCard: {
    backgroundColor: '#181818',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#404040',
    padding: 16,
    marginBottom: 12,
  },
  answerVariantCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  answerVariantCardTitle: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
    color: '#F7FDFA',
    fontFamily: Platform.select({
      ios: 'Onest-Medium',
      android: 'Onest-Medium',
      web: 'Onest, sans-serif',
    }),
  },
  copyButton: {
    padding: 4,
  },
  copyIcon: {
    width: 20,
    height: 20,
  },
  answerVariantCardText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#C5C1B9',
    fontFamily: Platform.select({
      ios: 'Onest-Regular',
      android: 'Onest-Regular',
      web: 'Onest, sans-serif',
    }),
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
