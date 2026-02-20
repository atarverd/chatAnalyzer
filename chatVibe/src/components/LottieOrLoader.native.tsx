import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { colors } from '../theme/colors';
import type { StyleProp, ViewStyle } from 'react-native';

type Props = {
  // kept for API parity with web
  source?: any;
  style?: StyleProp<ViewStyle>;
  done?: boolean;
  loadingRange?: [number, number];
  doneRange?: [number, number];
};

export function LottieOrLoader({ style }: Props) {
  return (
    <View style={style}>
      <ActivityIndicator color={colors.lightBlue} size="large" />
    </View>
  );
}
