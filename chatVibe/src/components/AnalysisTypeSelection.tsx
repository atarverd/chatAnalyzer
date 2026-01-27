import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from './Button';

type AnalysisTypeSelectionProps = {
  onSelectType: (type: 'personal' | 'business' | 'qualities') => void;
};

export function AnalysisTypeSelection({
  onSelectType,
}: AnalysisTypeSelectionProps) {
  return (
    <>
      <Text style={styles.drawerSubtitle}>Select analysis type</Text>
      <Button
        title="Personal"
        onPress={() => onSelectType('personal')}
        style={styles.typeButton}
      />
      <Button
        title="Business"
        onPress={() => onSelectType('business')}
        style={styles.typeButton}
      />
      <Button
        title="Qualities"
        onPress={() => onSelectType('qualities')}
        style={styles.typeButton}
      />
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
    marginBottom: 12,
  },
});

