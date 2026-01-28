import React, { useEffect, useRef } from 'react';
import LottieView from 'lottie-react-native';
import type { StyleProp, ViewStyle } from 'react-native';

type Props = {
  source: any;
  style?: StyleProp<ViewStyle>;
  done?: boolean;
  loadingRange?: [number, number];
  doneRange?: [number, number];
};

export function LottieOrLoader({
  source,
  style,
  done = false,
  loadingRange = [0, 60],
  doneRange = [60, 130],
}: Props) {
  //@ts-ignore
  const ref = useRef<LottieView>(null);

  useEffect(() => {
    const view = ref.current;
    if (!view) return;

    if (done) {
      view.play(doneRange[0], doneRange[1]);
    } else {
      view.play(loadingRange[0], loadingRange[1]);
    }
  }, [done, loadingRange, doneRange]);

  return (
    <LottieView
      ref={ref}
      source={source}
      autoPlay={false}
      loop={true}
      style={style}

    />
  );
}
