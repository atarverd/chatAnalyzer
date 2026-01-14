import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ErrorViewProps = {
  error: any;
  onRetry: () => void;
  onLogout: () => void;
};

export function ErrorView({ error, onRetry, onLogout }: ErrorViewProps) {
  let errorMessage = 'Failed to load chats';
  if ('status' in error) {
    if (error.status === 'FETCH_ERROR') {
      errorMessage = 'Network error - check your connection';
    } else if (error.status === 'PARSING_ERROR') {
      errorMessage = 'Invalid response format';
    } else if (error.data) {
      errorMessage =
        typeof error.data === 'object'
          ? JSON.stringify(error.data)
          : String(error.data);
    }
  } else if ('message' in error && error.message) {
    errorMessage = error.message;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.center}>
        <Text style={styles.errorText}>
          Failed to load chats. Please try again.
        </Text>
        <Text style={styles.errorDetails}>{errorMessage}</Text>
        <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorDetails: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#007AFF',
    marginBottom: 12,
  },
  retryText: {
    color: '#fff',
    fontWeight: '500',
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#ff3b30',
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
});
