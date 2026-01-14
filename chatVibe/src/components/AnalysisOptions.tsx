import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

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
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
      <ScrollView style={styles.optionsScroll}>
        {getOptions().map((option) => (
          <TouchableOpacity
            key={option.key}
            style={styles.optionButton}
            onPress={() => onRunAnalysis(option.key)}
          >
            <Text style={styles.optionButtonText}>{option.text}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  optionsScroll: {
    maxHeight: 400,
  },
  optionButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  optionButtonText: {
    color: '#333',
    fontSize: 14,
    textAlign: 'center',
  },
});

