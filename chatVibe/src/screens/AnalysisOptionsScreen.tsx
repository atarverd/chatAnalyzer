import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
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
  | 'character'
  | 'communication'
  | 'mistakes'
  | 'dynamics'
  | null;

type AnalysisTone = 'neutral' | 'direct' | 'supportive';

export function AnalysisOptionsScreen({
  chat,
  onBack,
  onStartAnalysis,
}: AnalysisOptionsScreenProps) {
  const insets = useSafeAreaInsets();
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionType>(null);
  const [selectedTone, setSelectedTone] = useState<AnalysisTone>('neutral');

  const isPersonal =
    chat.type.toLowerCase().includes('личн') ||
    chat.type.toLowerCase().includes('personal');

  const questionTypes = [
    {
      id: 'character' as QuestionType,
      icon: ImageAssets.heartIcon,
      text: 'Характер общения',
    },
    {
      id: 'communication' as QuestionType,
      icon: ImageAssets.chatIcon,
      text: 'Как лучше общаться',
    },
    {
      id: 'mistakes' as QuestionType,
      icon: ImageAssets.alertIcon,
      text: 'Где я делаю ошибки',
    },
    {
      id: 'dynamics' as QuestionType,
      icon: ImageAssets.chartIcon,
      text: 'Понять динамику',
    },
  ];

  const tones = [
    { id: 'neutral' as AnalysisTone, text: 'Нейтральный' },
    { id: 'direct' as AnalysisTone, text: 'Прямой/честный' },
    { id: 'supportive' as AnalysisTone, text: 'Поддерживающий' },
  ];

  const handleStart = () => {
    if (selectedQuestion) {
      onStartAnalysis(selectedQuestion, selectedTone);
    }
  };

  return (
    <BackgroundWrapper showGlow showHeader={false}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <View style={[styles.content, { paddingTop: insets.top + 25 }]}>
          <View style={styles.header}>
            <BackButton onPress={onBack} />
            <View style={styles.headerCenter}>
              <Text style={styles.headerName}>{chat.title}</Text>
              <View style={styles.headerTypeContainer}>
                <Text style={styles.headerTypeIcon}>
                  {isPersonal ? '👤' : '👥'}
                </Text>
                <Text style={styles.headerType}>
                  {isPersonal ? 'Личный чат' : 'Групповой чат'}
                </Text>
              </View>
            </View>
            <View style={styles.headerAvatar}>
              <Avatar name={chat.title} size={40} />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Что вы хотите узнать?</Text>
            <View style={styles.questionGrid}>
              {questionTypes.map((question) => {
                const isSelected = selectedQuestion === question.id;
                return (
                  <TouchableOpacity
                    key={question.id}
                    onPress={() => setSelectedQuestion(question.id)}
                    activeOpacity={0.8}
                    style={styles.questionCardWrapper}
                  >
                    <LinearGradient
                      colors={
                        isSelected
                          ? ['rgba(52, 199, 89, 0.3)', 'rgba(25, 97, 43, 0.3)']
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
                        <ExpoImage
                          source={question.icon}
                          style={styles.questionIcon}
                          contentFit='contain'
                        />
                        <Text
                          style={[
                            styles.questionText,
                            isSelected && styles.questionTextActive,
                          ]}
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
            <Text style={styles.sectionTitle}>Тон анализа</Text>
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
                          ? ['rgba(52, 199, 89, 0.3)', 'rgba(25, 97, 43, 0.3)']
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

          <View style={styles.buttonContainer}>
            <GlassButton
              title='Начать анализ'
              onPress={handleStart}
              disabled={!selectedQuestion}
            />
          </View>
        </View>
      </SafeAreaView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 26,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    paddingTop: 16,
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
      android: 'Onest_600SemiBold',
      web: 'Onest, sans-serif',
    }),
  },
  headerTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTypeIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  headerType: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: Platform.select({
      ios: 'Onest-Regular',
      android: 'Onest_400Regular',
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
      android: 'Onest_600SemiBold',
      web: 'Onest, sans-serif',
    }),
  },
  questionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  questionCardWrapper: {
    width: '47%',
    aspectRatio: 1.2,
  },
  questionCardBorder: {
    flex: 1,
    borderRadius: 16,
    padding: 1,
  },
  questionCard: {
    flex: 1,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: 16,
  },
  questionIcon: {
    width: 21,
    height: 21,
    marginBottom: 8,
  },
  questionText: {
    fontSize: 17,
    fontWeight: '400',
    color: '#fff',
    textAlign: 'left',
    fontFamily: Platform.select({
      ios: 'SF Pro Text',
      android: 'sans-serif',
      web: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
    }),
    lineHeight: 22,
    letterSpacing: -0.43,
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
    color: '#fff',
    fontFamily: Platform.select({
      ios: 'Onest-Regular',
      android: 'Onest_400Regular',
      web: 'Onest, sans-serif',
    }),
  },
  toneButtonTextActive: {
    color: '#34C759',
    fontWeight: '600',
  },
  buttonContainer: {
    marginTop: 32,
    marginBottom: 26,
    alignItems: 'center',
  },
});
