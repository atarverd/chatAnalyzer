import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { colors } from '../theme/colors';
import type { StyleProp, ViewStyle } from 'react-native';

type Props = {
  // kept for API parity with native
  source: any;
  style?: StyleProp<ViewStyle>;
};

export function LottieOrLoader({ style }: Props) {
  return (
    <View style={style}>
      <ActivityIndicator color={colors.lightBlue} />
    </View>
  );
}


