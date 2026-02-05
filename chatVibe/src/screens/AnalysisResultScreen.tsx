import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { Image as ExpoImage } from 'expo-image';
import { LottieOrLoader } from '../components/LottieOrLoader';
import { BackgroundWrapper } from '../components/BackgroundWrapper';
import { BackButton } from '../components/BackButton';
import { Avatar } from '../components/Avatar';
import { ImageAssets } from '../utils/imageCache';
import { useTranslation } from 'react-i18next';
import { processAvatarUrl } from '../utils/avatarUrl';

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
  onBack: () => void;
  onReanalyze: () => void;
};

const QUESTION_LABELS: Record<string, string> = {
  character: 'Характер общения',
  communication: 'Как лучше общаться',
  mistakes: 'Где я делаю ошибки',
  dynamics: 'Понять динамику',
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
      const timer = setTimeout(() => {
        setIsDone(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isAnalyzing) {
      setIsDone(false);
    }
  }, [isAnalyzing, result]);

  const insets = useSafeAreaInsets();

  return (
    <BackgroundWrapper showGlow showHeader={false}>
       <SafeAreaView
         style={styles.safeArea}
         edges={Platform.OS === 'android' ? ['bottom'] : []}
       >
        <View style={[styles.header, { paddingTop: Platform.OS === 'web' ? 24 : insets.top + 24 }]}>
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

        {isDone && (
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeaderLeft}>
              <Text style={styles.sectionLabelTop}>
                {t('analysis.whatToStudy')}
              </Text>
              <Text style={styles.sectionValue}>{questionLabel}</Text>
            </View>
            {!isAnalyzing && (
              <TouchableOpacity
                onPress={onReanalyze}
                activeOpacity={0.8}
                style={styles.reanalyzeButton}
              >
                <ExpoImage
                  source={ImageAssets.reAnalyzeIcon}
                  style={styles.reanalyzeIcon}
                  contentFit='contain'
                />
              </TouchableOpacity>
            )}
          </View>
        )}

        <ScrollView
          style={styles.bodyScroll}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
            {!isDone ? (
              <View style={styles.loadingContainer}>
               <LottieOrLoader
                  source={require('../../assets/Animation.json')}
                  style={styles.loadingAnimation}
                  done={!isAnalyzing}
                />
                <Text style={styles.loadingTitle}>
                  {t('analysis.analyzingTitle')}
                </Text>
                <Text style={styles.loadingSubtitle}>
                  {t('analysis.analyzingSubtitle')}
                </Text>
              </View>
            ) : (
              <View style={styles.resultContainer}>
                <Text style={[styles.sectionLabel, styles.resultSectionLabel]}>
                  {t('analysis.analysisResult')}
                </Text>
                <Text style={styles.resultText}>{result}</Text>
              </View>
            )}
        </ScrollView>
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
    paddingHorizontal: 34,
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
    paddingBottom: 32,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // paddingTop: 40,
    paddingBottom: 100,
  },
  loadingAnimation: {
    width: 180,
    height: 180,
  },
  loadingTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    // marginTop: 24,
    marginBottom: 8,
    fontFamily: Platform.select({
      ios: 'Onest-SemiBold',
      android: 'Onest-SemiBold',
      web: 'Onest, sans-serif',
    }),
  },
  loadingSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#C5C1B9',
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: 'Onest-Regular',
      android: 'Onest-Regular',
      web: 'Onest, sans-serif',
    }),
    lineHeight: 20,
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
});
