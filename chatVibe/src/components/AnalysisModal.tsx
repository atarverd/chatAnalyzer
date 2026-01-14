import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Animated,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnalysisTypeSelection } from './AnalysisTypeSelection';
import { AnalysisOptions } from './AnalysisOptions';
import { AnalysisResult } from './AnalysisResult';
import { Avatar } from './Avatar';

type Chat = {
  id: number;
  title: string;
  avatar_url?: string;
};

type AnalysisModalProps = {
  visible: boolean;
  selectedChat: Chat | null;
  drawerStep: 'type' | 'options' | 'result';
  selectedType: 'personal' | 'business' | 'qualities' | null;
  analysisResult: string;
  isAnalyzing: boolean;
  slideAnim: Animated.Value;
  onClose: () => void;
  onSelectType: (type: 'personal' | 'business' | 'qualities') => void;
  onBackToType: () => void;
  onRunAnalysis: (analysisSubtype: string) => void;
};

export function AnalysisModal({
  visible,
  selectedChat,
  drawerStep,
  selectedType,
  analysisResult,
  isAnalyzing,
  slideAnim,
  onClose,
  onSelectType,
  onBackToType,
  onRunAnalysis,
}: AnalysisModalProps) {
  const insets = useSafeAreaInsets();

  if (!selectedChat) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      onRequestClose={onClose}
      animationType='none'
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          style={[
            styles.modalContent,
            {
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [600, 0],
                  }),
                },
              ],
              paddingBottom: insets.bottom + 20,
            },
          ]}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.drawerHeader}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <View style={styles.avatarContainer}>
              <Avatar name={selectedChat.title} size={80} />
            </View>
            <Text style={styles.drawerTitle}>{selectedChat.title}</Text>
          </View>

          {drawerStep === 'type' && (
            <AnalysisTypeSelection onSelectType={onSelectType} />
          )}

          {drawerStep === 'options' && (
            <AnalysisOptions
              selectedType={selectedType}
              onBack={onBackToType}
              onRunAnalysis={onRunAnalysis}
            />
          )}

          {drawerStep === 'result' && (
            <AnalysisResult
              result={analysisResult}
              isAnalyzing={isAnalyzing}
              onClose={onClose}
            />
          )}
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  drawerHeader: {
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  avatarContainer: {
    marginBottom: 12,
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#333',
    fontWeight: '600',
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
});

