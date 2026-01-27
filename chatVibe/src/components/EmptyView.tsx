import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackgroundWrapper } from './BackgroundWrapper';

export function EmptyView() {
  return (
    <BackgroundWrapper>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.center}>
          <Text style={styles.emptyText}>No chats found</Text>
        </View>
      </SafeAreaView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
