import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import Toast from 'react-native-toast-message';
import { store } from './src/store';
import { AuthScreen } from './src/screens/AuthScreen';
import { ChatsScreen } from './src/screens/ChatsScreen';
import { useAuthStatusQuery } from './src/services/api';

function Root() {
  const { data, isLoading } = useAuthStatusQuery();

  if (isLoading) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        edges={['top', 'bottom']}
      >
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  return data?.authorized ? <ChatsScreen /> : <AuthScreen />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <StatusBar style='dark' hidden={true} />
        <Root />
        <Toast />
      </Provider>
    </SafeAreaProvider>
  );
}
