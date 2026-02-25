import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackgroundWrapper } from './BackgroundWrapper';
import { useTranslation } from 'react-i18next';
import { colors } from '../theme/colors';

type EmptyViewProps = {
  embedded?: boolean;
};

export function EmptyView({ embedded }: EmptyViewProps) {
  const { t } = useTranslation();
  const content = (
    <View style={styles.center}>
      <Text style={styles.emptyText}>{t('empty.noChatsFound')}</Text>
    </View>
  );

  if (embedded) {
    return content;
  }

  return (
    <BackgroundWrapper>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {content}
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
    color: colors.white,
    fontFamily: Platform.select({
      ios: 'Onest-Regular',
      android: 'Onest-Regular',
      web: 'Onest, sans-serif',
    }),
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: 0,
  },
});
