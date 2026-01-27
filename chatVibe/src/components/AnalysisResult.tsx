import React from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { Button } from './Button';

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
  return (
    <>
      <Button
        title="← Close"
        onPress={onClose}
        style={styles.backButton}
      />
      <ScrollView
        style={styles.resultScroll}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        {isAnalyzing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator />
            <Text style={styles.modalLoadingText}>Analyzing...</Text>
          </View>
        ) : (
          <Text style={styles.resultText}>{result}</Text>
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
    maxHeight: 400,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  modalLoadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  resultText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
    padding: 8,
  },
});

