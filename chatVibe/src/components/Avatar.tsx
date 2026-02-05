import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image as ExpoImage } from 'expo-image';

type AvatarProps = {
  name: string;
  size?: number;
  avatarUrl?: string;
};

export function Avatar({ name, size = 40, avatarUrl }: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  const getInitials = (name: string) => {
    if (!name || name.trim() === '') return '?';
    
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const getBackgroundColor = (name: string) => {
    const colors = [
      '#667eea',
      '#f093fb',
      '#4facfe',
      '#43e97b',
      '#fa709a',
      '#fee140',
      '#30cfd0',
      '#a8edea',
      '#ff9a9e',
      '#fecfef',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const initials = getInitials(name);
  const backgroundColor = getBackgroundColor(name);

  const shouldShowImage = avatarUrl && avatarUrl.includes('chatvibe.dategram.io') && !imageError;

  if (shouldShowImage) {
    return (
      <View
        style={[
          styles.avatar,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            overflow: 'hidden',
          },
        ]}
      >
        <ExpoImage
          source={{ uri: avatarUrl }}
          style={{
            width: size,
            height: size,
          }}
          contentFit='cover'
          contentPosition='center'
          onError={() => setImageError(true)}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
        },
      ]}
    >
      <Text
        style={[
          styles.initials,
          {
            fontSize: size * 0.4,
          },
        ]}
      >
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: '#fff',
    fontWeight: '600',
  },
});

