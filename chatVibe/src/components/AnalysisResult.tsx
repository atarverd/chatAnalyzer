import React from 'react';
import { View, Text, ScrollView, StyleSheet, Platform } from 'react-native';
import { Button } from './Button';
import { useTranslation } from 'react-i18next';
import { LottieOrLoader } from './LottieOrLoader';

const loadingAnimation = require('../../assets/Animation.json');

type AnalysisResultProps = {
  result: string;
  isAnalyzing: boolean;
  onClose: () => void;
};

export function AnalysisResult({
  result,
  isAnalyzing,
  onClose,
}: AnalysisResultProps) {
  const { t } = useTranslation();
  return (
    <>
      <Button
        title={`← ${t('common.close')}`}
        onPress={onClose}
        style={styles.backButton}
      />
      <ScrollView
        style={styles.resultScroll}
        contentContainerStyle={styles.resultContent}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        {isAnalyzing ? (
          <View style={styles.loadingContainer}>
            <LottieOrLoader source={loadingAnimation} style={styles.loadingAnimation} />
            <Text style={styles.loadingTitle}>{t('analysis.analyzingTitle')}</Text>
            <Text style={styles.loadingSubtitle}>
              {t('analysis.analyzingSubtitle')}
            </Text>
          </View>
        ) : (
          <View style={styles.resultContainer}>
            <Text style={styles.sectionLabel}>{t('analysis.whatToStudy')}</Text>
            <Text style={styles.sectionValue}>{t('analysis.questionLabels.character')}</Text>

            <Text style={[styles.sectionLabel, styles.resultSectionLabel]}>
              {t('analysis.analysisResult')}
            </Text>
            <Text style={styles.resultText}>{result}</Text>
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
    width: 'auto',
    height: 'auto',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'transparent',
  },
  resultScroll: {
    maxHeight: 500,
  },
  resultContent: {
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingAnimation: {
    width: 120,
    height: 120,
    marginBottom: 32,
  },
  loadingTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
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
    paddingVertical: 24,
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
