import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, View } from 'react-native';

import { RootNavigator } from '@navigation/RootNavigator';
import { useSettings } from '@hooks/useSettings';

const queryClient = new QueryClient();

export default function App() {
  const { ready } = useSettings();

  return (
    <QueryClientProvider client={queryClient}>
      <View style={styles.container}>
        <SafeAreaView style={styles.container}>
          {ready ? <RootNavigator /> : <ActivityIndicator style={styles.loader} />}
        </SafeAreaView>
        <StatusBar style="dark" />
      </View>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  loader: {
    flex: 1
  }
});
