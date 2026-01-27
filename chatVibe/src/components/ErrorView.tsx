import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackgroundWrapper } from './BackgroundWrapper';
import { Button } from './Button';

type ErrorViewProps = {
  error: any;
  onRetry: () => void;
};

export function ErrorView({ error, onRetry }: ErrorViewProps) {
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
    <BackgroundWrapper>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.center}>
          <Text style={styles.errorText}>
            Failed to load chats. Please try again.
          </Text>
          <Text style={styles.errorDetails}>{errorMessage}</Text>
          <Button title='Retry' onPress={onRetry} />
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
  errorText: {
    fontSize: 16,
    color: '#FE3F21',
    fontFamily: Platform.select({
      ios: 'Onest-Regular',
      android: 'Onest_400Regular',
      web: 'Onest, sans-serif',
    }),
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: 0,
    textAlign: 'center',
    marginBottom: 8,
  },
  errorDetails: {
    fontSize: 16,
    color: '#FE3F21',
    fontFamily: Platform.select({
      ios: 'Onest-Regular',
      android: 'Onest_400Regular',
      web: 'Onest, sans-serif',
    }),
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: 0,
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
});
