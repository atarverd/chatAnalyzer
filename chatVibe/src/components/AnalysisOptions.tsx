import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Button } from './Button';

type AnalysisOptionsProps = {
  selectedType: 'personal' | 'business' | 'qualities' | null;
  onBack: () => void;
  onRunAnalysis: (analysisSubtype: string) => void;
};

const PERSONAL_OPTIONS = [
  { key: 'personal_love', text: 'Есть ли любовь' },
  { key: 'personal_sex', text: 'Хочет ли секса со мной партнер' },
  { key: 'personal_relationship', text: 'Какие у нас отношения' },
  { key: 'personal_communication', text: 'Как мне правильно общаться с партнером' },
];

const BUSINESS_OPTIONS = [
  { key: 'business_relationship', text: 'Какие у нас отношения с партнером' },
  { key: 'business_communication', text: 'Как мне общаться с партнером' },
  { key: 'business_improve', text: 'Где я делаю что-то не так и как исправить' },
];

const QUALITIES_OPTIONS = [
  { key: 'qualities_strengths', text: 'В чем мои сильные стороны' },
  { key: 'qualities_improve', text: 'Что я могу улучшить в общении с людьми' },
  { key: 'qualities_liked', text: 'Кому я нравлюсь' },
  { key: 'qualities_wanted', text: 'Кто меня хочет' },
];

export function AnalysisOptions({
  selectedType,
  onBack,
  onRunAnalysis,
}: AnalysisOptionsProps) {
  const getOptions = () => {
    switch (selectedType) {
      case 'personal':
        return PERSONAL_OPTIONS;
      case 'business':
        return BUSINESS_OPTIONS;
      case 'qualities':
        return QUALITIES_OPTIONS;
      default:
        return [];
    }
  };

  return (
    <>
      <Button
        title="← Back"
        onPress={onBack}
        style={styles.backButton}
      />
      <ScrollView
        style={styles.optionsScroll}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        {getOptions().map((option) => (
          <Button
            key={option.key}
            title={option.text}
            onPress={() => onRunAnalysis(option.key)}
            style={styles.optionButton}
            textStyle={styles.optionButtonText}
          />
        ))}
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
  optionsScroll: {
    maxHeight: 400,
  },
  optionButton: {
    marginBottom: 12,
    backgroundColor: '#f0f0f0',
  },
  optionButtonText: {
    color: '#333',
    fontSize: 14,
  },
});

