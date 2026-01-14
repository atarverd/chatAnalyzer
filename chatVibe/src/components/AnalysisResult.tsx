import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';

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
      <TouchableOpacity style={styles.backButton} onPress={onClose}>
        <Text style={styles.backButtonText}>← Close</Text>
      </TouchableOpacity>
      <ScrollView style={styles.resultScroll}>
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
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
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

