import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { BackgroundWrapper } from '../components/BackgroundWrapper';
import { Avatar } from '../components/Avatar';
import { BackButton } from '../components/BackButton';
import { ImageAssets } from '../utils/imageCache';
import { processAvatarUrl } from '../utils/avatarUrl';
import { useTranslation } from 'react-i18next';

type Chat = {
  id: number;
  title: string;
  type: string;
  avatar_url?: string;
};

type NotEnoughDataScreenProps = {
  chat: Chat;
  onBack: () => void;
};

export function NotEnoughDataScreen({
  chat,
  onBack,
}: NotEnoughDataScreenProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const isPersonal =
    chat.type.toLowerCase() === 'private' ||
    chat.type.toLowerCase().includes('личн') ||
    chat.type.toLowerCase().includes('personal');
  const avatarUrl = processAvatarUrl(chat.avatar_url);

  return (
    <BackgroundWrapper showGlow showHeader={false}>
      <SafeAreaView
        style={styles.safeArea}
        edges={Platform.OS === 'android' ? ['bottom'] : []}
      >
        <View
          style={[
            styles.header,
            { paddingTop: Platform.OS === 'web' ? 24 : insets.top + 24 },
          ]}
        >
          <BackButton onPress={onBack} />
          <View style={styles.headerCenter}>
            <Text style={styles.headerName}>{chat.title}</Text>
            <View style={styles.headerTypeContainer}>
              <ExpoImage
                source={
                  isPersonal
                    ? ImageAssets.privateChatIcon
                    : ImageAssets.groupChatIcon
                }
                style={styles.headerTypeIcon}
                contentFit='contain'
              />
              <Text style={styles.headerType}>
                {isPersonal ? t('chats.personalChat') : t('chats.groupChat')}
              </Text>
            </View>
          </View>
          <View style={styles.headerAvatar}>
            <Avatar name={chat.title} size={40} avatarUrl={avatarUrl} />
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <ExpoImage
              source={ImageAssets.notEnough}
              style={styles.notEnoughIcon}
              contentFit='contain'
            />
          </View>
          <Text style={styles.title}>{t('analysis.notEnoughData')}</Text>
          <Text style={styles.subtitle}>
            {t('analysis.notEnoughDataSubtitle')}
          </Text>
        </View>
      </SafeAreaView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 6,
    textAlign: 'center',
    fontFamily: Platform.select({
      ios: 'Onest-SemiBold',
      android: 'Onest-SemiBold',
      web: 'Onest, sans-serif',
    }),
  },
  headerTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTypeIcon: {
    width: 15,
    height: 15,
    marginRight: 4,
  },
  headerType: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: Platform.select({
      ios: 'Onest-Regular',
      android: 'Onest-Regular',
      web: 'Onest, sans-serif',
    }),
  },
  headerAvatar: {
    marginLeft: 12,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 34,
    marginTop: -100,
  },
  iconContainer: {
    marginBottom: 24,
  },
  notEnoughIcon: {
    width: 52,
    height: 52,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: Platform.select({
      ios: 'Onest-SemiBold',
      android: 'Onest-SemiBold',
      web: 'Onest, sans-serif',
    }),
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: Platform.select({
      ios: 'SF-Pro',
      android: 'SF-Pro',
      web: 'SF-Pro, -apple-system, BlinkMacSystemFont, sans-serif',
    }),
  },
});
