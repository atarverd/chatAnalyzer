import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function ChatsHeader() {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Chats</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
});

