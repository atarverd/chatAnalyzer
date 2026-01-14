import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type ChatsHeaderProps = {
  onLogout: () => void;
};

export function ChatsHeader({ onLogout }: ChatsHeaderProps) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Chats</Text>
      <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
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
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#ff3b30',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

