import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type AnalysisTypeSelectionProps = {
  onSelectType: (type: 'personal' | 'business' | 'qualities') => void;
};

export function AnalysisTypeSelection({
  onSelectType,
}: AnalysisTypeSelectionProps) {
  return (
    <>
      <Text style={styles.drawerSubtitle}>Select analysis type</Text>
      <TouchableOpacity
        style={styles.typeButton}
        onPress={() => onSelectType('personal')}
      >
        <Text style={styles.typeButtonText}>Personal</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.typeButton}
        onPress={() => onSelectType('business')}
      >
        <Text style={styles.typeButtonText}>Business</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.typeButton}
        onPress={() => onSelectType('qualities')}
      >
        <Text style={styles.typeButtonText}>Qualities</Text>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  drawerSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  typeButton: {
    backgroundColor: '#667eea',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 12,
  },
  typeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});

