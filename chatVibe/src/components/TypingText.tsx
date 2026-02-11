import React, { useState, useEffect } from 'react';
import { Text, StyleSheet, Platform, StyleProp, TextStyle } from 'react-native';

type TypingTextProps = {
  text: string;
  speed?: number;
  style?: StyleProp<TextStyle>;
};

export function TypingText({ text, speed = 50, style }: TypingTextProps) {
  const [displayedLength, setDisplayedLength] = useState(0);

  useEffect(() => {
    setDisplayedLength(0);
  }, [text]);

  useEffect(() => {
    if (displayedLength >= text.length) return;

    const timer = setTimeout(() => {
      setDisplayedLength((prev) => Math.min(prev + 1, text.length));
    }, speed);

    return () => clearTimeout(timer);
  }, [displayedLength, text.length, speed]);

  return <Text style={style}>{text.slice(0, displayedLength)}</Text>;
}
