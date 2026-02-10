import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { Avatar } from './Avatar';
import { ImageAssets } from '../utils/imageCache';
import { useTranslation } from 'react-i18next';
import { processAvatarUrl } from '../utils/avatarUrl';

type Chat = {
  id: number;
  title: string;
  type: string;
  avatar_url?: string;
};

type ChatItemProps = {
  chat: Chat;
  onAnalyze: (chat: Chat) => void;
  hasAnalysis?: boolean;
  analysisTimestamp?: number;
  isPending?: boolean;
};

function formatAnalysisDate(timestamp: number): string {
  const d = new Date(timestamp);
  const now = new Date();
  const isToday =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (isToday) {
    return d.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}.${month}`;
}

export function ChatItem({
  chat,
  onAnalyze,
  hasAnalysis = false,
  analysisTimestamp,
  isPending = false,
}: ChatItemProps) {
  const { t } = useTranslation();
  const isPersonal =
    chat.type.toLowerCase() === 'private' ||
    chat.type.toLowerCase().includes('личн') ||
    chat.type.toLowerCase().includes('personal');
  const chatTypeText = isPersonal
    ? t('chats.personalChat')
    : t('chats.groupChat');
  const chatTypeIconSource = isPersonal
    ? ImageAssets.privateChatIcon
    : ImageAssets.groupChatIcon;
  const avatarUrl = processAvatarUrl(chat.avatar_url);

  return (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => onAnalyze(chat)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <Avatar name={chat.title} size={56} avatarUrl={avatarUrl} />
      </View>
      <View style={styles.chatInfo}>
        <Text numberOfLines={1} style={styles.chatTitle}>
          {chat.title}
        </Text>
        <View style={styles.chatTypeContainer}>
          <ExpoImage
            source={chatTypeIconSource}
            style={styles.chatTypeIcon}
            contentFit='contain'
          />
          <Text style={styles.chatType}>{chatTypeText}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.analyzeButton}
        onPress={() => onAnalyze(chat)}
        activeOpacity={0.7}
      >
        {isPending ? (
          <>
            <ActivityIndicator
              size='small'
              color='#34C759'
              style={styles.loadingIndicator}
            />
            <ExpoImage
              source={ImageAssets.arrowIcon}
              style={styles.analyzeButtonArrow}
              contentFit='contain'
            />
          </>
        ) : hasAnalysis ? (
          <>
            <View style={styles.analysisMetaContainer}>
              {analysisTimestamp != null && (
                <Text style={styles.analysisDateText} numberOfLines={1}>
                  {formatAnalysisDate(analysisTimestamp)}
                </Text>
              )}
              <View style={styles.checkmarkContainer}>
                <View style={styles.checkmarkCircle} />
                <ExpoImage
                  source={ImageAssets.doneIcon}
                  style={styles.checkmarkIcon}
                  contentFit='contain'
                />
              </View>
            </View>
            <ExpoImage
              source={ImageAssets.arrowIcon}
              style={styles.analyzeButtonArrow}
              contentFit='contain'
            />
          </>
        ) : (
          <>
            <Text style={styles.analyzeButtonText}>{t('chats.analyze')}</Text>
            <ExpoImage
              source={ImageAssets.arrowIcon}
              style={styles.analyzeButtonArrow}
              contentFit='contain'
            />
          </>
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  avatarContainer: {
    marginRight: 12,
  },
  chatInfo: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  chatTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
    fontFamily: Platform.select({
      ios: 'Onest-SemiBold',
      android: 'Onest-SemiBold',
      web: 'Onest, sans-serif',
    }),
    letterSpacing: 0,
    textAlign: 'left',
  },
  chatTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatTypeIcon: {
    width: 15,
    height: 15,
    marginRight: 4,
  },
  chatType: {
    fontSize: 15,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: Platform.select({
      ios: 'SF Pro Text',
      android: 'SF-Pro',
      web: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
    }),
    lineHeight: 20,
    letterSpacing: -0.23,
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    flexShrink: 0,
  },
  analyzeButtonText: {
    fontSize: 17,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.6)',
    marginRight: 16,
    fontFamily: Platform.select({
      ios: 'SF Pro Text',
      android: 'SF-Pro',
      web: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif',
    }),
    lineHeight: 22,
    letterSpacing: -0.43,
    textAlign: 'right',
  },
  analyzeButtonArrow: {
    width: 8,
    height: 16,
  },
  analysisMetaContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  analysisDateText: {
    fontSize: 15,
    color: '#404040',
    marginBottom: 2,
    fontFamily: Platform.select({
      ios: 'SF-Pro',
      android: 'SF-Pro',
      web: 'SF-Pro, sans-serif',
    }),
  },
  checkmarkContainer: {
    position: 'relative',
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkCircle: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 12,
    backgroundColor: '#34C759',
    opacity: 0.15,
  },
  checkmarkIcon: {
    width: 8,
    height: 8,
    zIndex: 1,
  },
  loadingIndicator: {
    marginRight: 16,
  },
});
