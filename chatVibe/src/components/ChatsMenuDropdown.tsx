import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

type ChatsMenuDropdownProps = {
  visible: boolean;
  onClose: () => void;
  onRefresh: () => void;
  onHowItWorks: () => void;
  onLogout: () => void;
  /** Top offset in px - position dropdown just below menu button */
  anchorTop?: number;
};

export function ChatsMenuDropdown({
  visible,
  onClose,
  onRefresh,
  onHowItWorks,
  onLogout,
  anchorTop,
}: ChatsMenuDropdownProps) {
  const { t } = useTranslation();

  if (!visible) return null;

  const overlayStyle = [
    styles.overlay,
    anchorTop != null && { paddingTop: anchorTop },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={overlayStyle}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>
        <View style={styles.dropdownContainer}>
              <LinearGradient
                colors={[
                  'rgba(255, 255, 255, 0.12)',
                  'rgba(255, 255, 255, 0.02)',
                  'rgba(255, 255, 255, 0.12)',
                ]}
                locations={[0.1443, 0.4978, 0.8512]}
                start={{ x: 0.2, y: 0 }}
                end={{ x: 0.8, y: 1 }}
                style={styles.dropdownBorder}
              >
                <View style={styles.dropdown}>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      onRefresh();
                      onClose();
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="refresh" size={20} color="#fff" />
                    <Text style={styles.menuItemText}>{t('chats.refresh')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      onHowItWorks();
                      onClose();
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="help-circle-outline" size={20} color="#fff" />
                    <Text style={styles.menuItemText}>
                      {t('chats.howItWorks')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      onLogout();
                      onClose();
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="log-out-outline" size={20} color="#FF6B6B" />
                    <Text style={[styles.menuItemText, styles.logoutText]}>
                      {t('common.logout')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: Platform.OS === 'web' ? 81 : 100,
    paddingRight: 24,
  },
  dropdownContainer: {
    alignSelf: 'flex-end',
  },
  dropdownBorder: {
    borderRadius: 16,
    padding: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  dropdown: {
    backgroundColor: '#1A1A1A',
    borderRadius: 15,
    paddingVertical: 8,
    paddingHorizontal: 4,
    minWidth: 200,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#fff',
    fontFamily: Platform.select({
      ios: 'Onest-Regular',
      android: 'Onest-Regular',
      web: 'Onest, sans-serif',
    }),
  },
  logoutText: {
    color: '#FF6B6B',
  },
});
