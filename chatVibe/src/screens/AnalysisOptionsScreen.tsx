import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { BackgroundWrapper } from '../components/BackgroundWrapper';
import { Avatar } from '../components/Avatar';
import { BackButton } from '../components/BackButton';
import { GlassButton } from '../components/GlassButton';
import { ImageAssets } from '../utils/imageCache';
import { processAvatarUrl } from '../utils/avatarUrl';
import { useTranslation } from 'react-i18next';

type Chat = {
  id: number;
  title: string;
  type: string;
  avatar_url?: string;
};

type AnalysisOptionsScreenProps = {
  chat: Chat;
  onBack: () => void;
  onStartAnalysis: (questionType: string, tone: string) => void;
};

type QuestionType =
  | 'communication_character'
  | 'how_to_communicate_better'
  | 'where_am_i_making_mistakes'
  | 'understand_the_dynamic'
  | 'what_to_answer'
  | null;

type AnalysisTone = 'neutral' | 'direct' | 'supportive';

export function AnalysisOptionsScreen({
  chat,
  onBack,
  onStartAnalysis,
}: AnalysisOptionsScreenProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionType>(null);
  const [selectedTone, setSelectedTone] = useState<AnalysisTone>('neutral');

  const contentPaddingHorizontal = 34;
  const questionGridGap = 16;
  const contentWidth = screenWidth - contentPaddingHorizontal * 2;
  const cardsPerRow = contentWidth >= 380 ? 2 : 1;
  const questionCardWidth =
    cardsPerRow === 1
      ? contentWidth
      : (contentWidth - questionGridGap) / 2;

  const isPersonal =
    chat.type.toLowerCase() === 'private' ||
    chat.type.toLowerCase().includes('личн') ||
    chat.type.toLowerCase().includes('personal');
  const avatarUrl = processAvatarUrl(chat.avatar_url);

  const questionTypes = [
    {
      id: 'communication_character' as QuestionType,
      icon: ImageAssets.heartIcon,
      text: t('analysis.questionLabels.communication_character'),
    },
    {
      id: 'how_to_communicate_better' as QuestionType,
      icon: ImageAssets.chatIconCard,
      text: t('analysis.questionLabels.how_to_communicate_better'),
    },
    {
      id: 'where_am_i_making_mistakes' as QuestionType,
      icon: ImageAssets.alertIcon,
      text: t('analysis.questionLabels.where_am_i_making_mistakes'),
    },
    {
      id: 'understand_the_dynamic' as QuestionType,
      icon: ImageAssets.chartIcon,
      text: t('analysis.questionLabels.understand_the_dynamic'),
    },
    {
      id: 'what_to_answer' as QuestionType,
      icon: ImageAssets.questionIcon,
      text: t('analysis.questionLabels.what_to_answer'),
    },
  ];

  const tones = [
    { id: 'neutral' as AnalysisTone, text: t('analysis.tones.neutral') },
    { id: 'direct' as AnalysisTone, text: t('analysis.tones.direct') },
    { id: 'supportive' as AnalysisTone, text: t('analysis.tones.supportive') },
  ];

  const handleStart = () => {
    if (selectedQuestion) {
      onStartAnalysis(selectedQuestion, selectedTone);
    }
  };

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
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          <View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t('analysis.whatToLearn')}
              </Text>
              <View style={styles.questionGrid}>
                {questionTypes.map((question) => {
                  const isSelected = selectedQuestion === question.id;
                  return (
                    <TouchableOpacity
                      key={question.id}
                      onPress={() => setSelectedQuestion(question.id)}
                      activeOpacity={0.8}
                      style={[
                        styles.questionCardWrapper,
                        { width: questionCardWidth },
                      ]}
                    >
                      <LinearGradient
                        colors={
                          isSelected
                            ? [
                                'rgba(52, 199, 89, 0.3)',
                                'rgba(25, 97, 43, 0.3)',
                              ]
                            : [
                                'rgba(255, 255, 255, 0.2)',
                                'rgba(255, 255, 255, 0.2)',
                              ]
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={styles.questionCardBorder}
                      >
                        <LinearGradient
                          colors={['#141715', '#141715']}
                          style={styles.questionCard}
                        >
                          <View style={styles.questionIconWrapper}>
                            <ExpoImage
                              source={question.icon}
                              style={styles.questionIcon}
                              contentFit='contain'
                              tintColor={isSelected ? '#34C759' : undefined}
                            />
                          </View>
                          <Text
                            style={[
                              styles.questionText,
                              isSelected && styles.questionTextActive,
                            ]}
                            numberOfLines={cardsPerRow === 1 ? 3 : 2}
                          >
                            {question.text}
                          </Text>
                        </LinearGradient>
                      </LinearGradient>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('analysis.tone')}</Text>
              <View style={styles.toneContainer}>
                {tones.map((tone) => {
                  const isSelected = selectedTone === tone.id;
                  return (
                    <TouchableOpacity
                      key={tone.id}
                      onPress={() => setSelectedTone(tone.id)}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={
                          isSelected
                            ? [
                                'rgba(52, 199, 89, 0.3)',
                                'rgba(25, 97, 43, 0.3)',
                              ]
                            : [
                                'rgba(255, 255, 255, 0.2)',
                                'rgba(255, 255, 255, 0.2)',
                              ]
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={styles.toneButtonBorder}
                      >
                        <LinearGradient
                          colors={['#141715', '#141715']}
                          style={styles.toneButton}
                        >
                          <Text
                            style={[
                              styles.toneButtonText,
                              isSelected && styles.toneButtonTextActive,
                            ]}
                          >
                            {tone.text}
                          </Text>
                        </LinearGradient>
                      </LinearGradient>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <GlassButton
              title={t('analysis.start')}
              onPress={handleStart}
              disabled={!selectedQuestion}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 34,
    paddingBottom: 36,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 32,
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
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: Platform.select({
      ios: 'Onest-Regular',
      android: 'Onest-Regular',
      web: 'Onest, sans-serif',
    }),
  },
  headerAvatar: {
    marginLeft: 12,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
    fontFamily: Platform.select({
      ios: 'Onest-SemiBold',
      android: 'Onest-SemiBold',
      web: 'Onest, sans-serif',
    }),
  },
  questionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  questionCardWrapper: {
    minWidth: 0,
    maxWidth: '100%',
  },
  questionCardBorder: {
    borderRadius: 16,
    padding: 1,
    overflow: 'hidden',
  },
  questionCard: {
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    flexDirection: 'row',
    gap: 12,
    overflow: 'hidden',
    minWidth: 0,
    flex: 1,
  },
  questionIconWrapper: {
    width: 21,
    height: 21,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  questionIcon: {
    width: 20,
    height: 20,
  },
  questionText: {
    flex: 1,
    minWidth: 0,
    fontSize: 15,
    fontWeight: '400',
    color: '#999999',
    textAlign: 'left',
    fontFamily: Platform.select({
      ios: 'SF-Pro',
      android: 'SF-Pro',
      web: 'SF-Pro, -apple-system, BlinkMacSystemFont, sans-serif',
    }),
    lineHeight: 20,
  },
  questionTextActive: {
    color: '#34C759',
    fontWeight: '400',
  },
  toneContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  toneButtonBorder: {
    borderRadius: 20,
    padding: 1,
  },
  toneButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 19,
  },
  toneButtonText: {
    fontSize: 14,
    color: '#999999',
    fontFamily: Platform.select({
      ios: 'Onest-Regular',
      android: 'Onest-Regular',
      web: 'Onest, sans-serif',
    }),
  },
  toneButtonTextActive: {
    color: '#34C759',
    fontWeight: '600',
  },
  buttonContainer: {
    marginTop: 32,
    alignItems: 'center',
  },
});
