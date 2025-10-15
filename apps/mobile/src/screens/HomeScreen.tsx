import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RootStackParamList } from '@navigation/RootNavigator';
import { useSettingsStore } from '@state/settingsStore';
import { LanguageOption, SUPPORTED_LANGUAGES } from '@utils/constants/languages';

const findLanguageLabel = (code: string) =>
  SUPPORTED_LANGUAGES.find((language: LanguageOption) => language.code === code)?.label ?? code;

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export const HomeScreen = ({ navigation }: Props) => {
  const { targetLanguage, nativeLanguage, learnerLevel } = useSettingsStore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lumi Language Tutor</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Target language</Text>
        <Text style={styles.value}>{findLanguageLabel(targetLanguage)}</Text>
        <Text style={styles.label}>Native language</Text>
        <Text style={styles.value}>{findLanguageLabel(nativeLanguage)}</Text>
        <Text style={styles.label}>Level</Text>
        <Text style={styles.value}>{learnerLevel}</Text>
        <Pressable style={styles.settingsButton} onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.settingsButtonText}>Adjust settings</Text>
        </Pressable>
      </View>
      <Pressable style={styles.primaryButton} onPress={() => navigation.navigate('Conversation')}>
        <Text style={styles.primaryButtonText}>Start conversation</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 64,
    backgroundColor: '#f5f5f5'
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 32,
    color: '#1f2933'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 12
  },
  value: {
    fontSize: 18,
    color: '#111827',
    fontWeight: '600'
  },
  primaryButton: {
    marginTop: 48,
    backgroundColor: '#2563eb',
    paddingVertical: 18,
    borderRadius: 28,
    alignItems: 'center'
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600'
  },
  settingsButton: {
    marginTop: 24,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#2563eb',
    borderRadius: 20,
    alignItems: 'center'
  },
  settingsButtonText: {
    color: '#2563eb',
    fontWeight: '500'
  }
});
