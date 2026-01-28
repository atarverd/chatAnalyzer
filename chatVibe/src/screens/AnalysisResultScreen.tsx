import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import { BackgroundWrapper } from '../components/BackgroundWrapper';
import { BackButton } from '../components/BackButton';
import { Avatar } from '../components/Avatar';

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
  const isPersonal =
    chat.type.toLowerCase().includes('личн') ||
    chat.type.toLowerCase().includes('personal');

  const questionLabel =
    (questionType && QUESTION_LABELS[questionType]) || 'Характер общения';

  return (
    <BackgroundWrapper showGlow showHeader={false}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.content}>
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

          <View style={styles.reanalyzeContainer}>
            <TouchableOpacity
              onPress={onReanalyze}
              activeOpacity={0.8}
              style={styles.reanalyzeButton}
            >
              <Text style={styles.reanalyzeIcon}>↺</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.bodyScroll}
            contentContainerStyle={styles.bodyContent}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          >
            {isAnalyzing ? (
              <View style={styles.loadingContainer}>
                <LottieView
                  source={require('../../assets/Animation.json')}
                  autoPlay
                  loop
                  style={styles.loadingAnimation}
                />
                <Text style={styles.loadingTitle}>Анализируем сообщения</Text>
                <Text style={styles.loadingSubtitle}>
                  Импортируем чаты для анализа
                </Text>
              </View>
            ) : (
              <View style={styles.resultContainer}>
                <Text style={styles.sectionLabel}>Что нужно изучить</Text>
                <Text style={styles.sectionValue}>{questionLabel}</Text>

                <Text style={[styles.sectionLabel, styles.resultSectionLabel]}>
                  Результат анализа
                </Text>
                <Text style={styles.resultText}>{result}</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  reanalyzeContainer: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  reanalyzeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#39E478',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reanalyzeIcon: {
    fontSize: 24,
    color: '#000000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 26,
    paddingTop: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 8,
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
    color: '#C5C1B9',
    fontFamily: Platform.select({
      ios: 'Onest-Regular',
      android: 'Onest_400Regular',
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
    paddingBottom: 32,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
    paddingBottom: 40,
  },
  loadingAnimation: {
    width: 120,
    height: 120,
  },
  loadingTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 8,
    fontFamily: Platform.select({
      ios: 'Onest-SemiBold',
      android: 'Onest_600SemiBold',
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
      android: 'Onest_400Regular',
      web: 'Onest, sans-serif',
    }),
    lineHeight: 20,
  },
  resultContainer: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: '#9A9A9A',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  sectionValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 24,
    fontFamily: Platform.select({
      ios: 'Onest-SemiBold',
      android: 'Onest_600SemiBold',
      web: 'Onest, sans-serif',
    }),
  },
  resultSectionLabel: {
    marginTop: 16,
  },
  resultText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#fff',
  },
});
