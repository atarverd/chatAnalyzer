import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Avatar } from './Avatar';

type Chat = {
  id: number;
  title: string;
  type: string;
  avatar_url?: string;
};

type ChatItemProps = {
  chat: Chat;
  onAnalyze: (chat: Chat) => void;
};

export function ChatItem({ chat, onAnalyze }: ChatItemProps) {
  return (
    <View style={styles.chatItem}>
      <View style={styles.avatarContainer}>
        <Avatar name={chat.title} size={40} />
      </View>
      <View style={styles.chatInfo}>
        <Text numberOfLines={1} style={styles.chatTitle}>
          {chat.title}
        </Text>
        <Text style={styles.chatType}>{chat.type}</Text>
      </View>
      <TouchableOpacity
        style={styles.analyzeButton}
        onPress={() => onAnalyze(chat)}
      >
        <Text style={styles.analyzeText}>Analyze</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  avatarContainer: {
    marginRight: 12,
  },
  chatInfo: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  chatType: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  analyzeButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#667eea',
  },
  analyzeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
});

