import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackgroundWrapper } from './BackgroundWrapper';
import { Button } from './Button';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { getApiErrorMessage } from '../utils/apiErrorMap';
import type { AppDispatch } from '../store';
import { logout } from '../features/auth/authSlice';
import { useLogoutMutation, api } from '../services/api';
import { colors } from '../theme/colors';

type ErrorViewProps = {
  error: any;
  onRetry: () => void;
};

export function ErrorView({ error, onRetry }: ErrorViewProps) {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const [logoutMutation] = useLogoutMutation();

  let errorMessage = t('errors.failedToLoadChats');
  if ('status' in error) {
    if (error.status === 'FETCH_ERROR') {
      errorMessage = t('errors.networkError');
    } else if (error.status === 'PARSING_ERROR') {
      errorMessage = t('errors.invalidResponse');
    } else if (error.data && (error.data.code || error.data.error)) {
      errorMessage = getApiErrorMessage(error, t, 'errors.failedToLoadChats');
    } else if (error.data) {
      errorMessage =
        typeof error.data === 'object'
          ? JSON.stringify(error.data)
          : String(error.data);
    }
  } else if ('message' in error && error.message) {
    errorMessage = error.message;
  }

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch (error) {
      // Ignore errors, still logout locally
    } finally {
      // Clear auth state
      dispatch(logout());
      // Clear RTK Query cache
      dispatch(api.util.resetApiState());
    }
  };

  return (
    <BackgroundWrapper>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.center}>
          <Text style={styles.errorText}>{t('errors.generic')}</Text>
          <Text style={styles.errorDetails}>{errorMessage}</Text>
          <Button title={t('common.retry')} onPress={onRetry} />
          <View style={styles.logoutButtonContainer}>
            <Button title={t('common.logout')} onPress={handleLogout} />
          </View>
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
    color: colors.error,
    fontFamily: Platform.select({
      ios: 'Onest-Regular',
      android: 'Onest-Regular',
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
    color: colors.error,
    fontFamily: Platform.select({
      ios: 'Onest-Regular',
      android: 'Onest-Regular',
      web: 'Onest, sans-serif',
    }),
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: 0,
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  logoutButtonContainer: {
    marginTop: 12,
  },
});
