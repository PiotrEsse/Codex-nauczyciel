import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RootStackParamList } from '@navigation/RootNavigator';
import { StorageService, type SessionHistoryEntry } from '@services/storage/storageService';
import { useSettingsStore } from '@state/settingsStore';
import { LanguageOption, SUPPORTED_LANGUAGES } from '@utils/constants/languages';

const findLanguageLabel = (code: string) =>
  SUPPORTED_LANGUAGES.find((language: LanguageOption) => language.code === code)?.label ?? code;

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export const HomeScreen = ({ navigation }: Props) => {
  const { targetLanguage, nativeLanguage, learnerLevel } = useSettingsStore();
  const [lastSession, setLastSession] = useState<SessionHistoryEntry | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const [latest] = await StorageService.getRecentSessions(1);
        if (!active) {
          return;
        }
        setLastSession(latest ?? null);
      })();
      return () => {
        active = false;
      };
    }, [])
  );

  const formatDuration = useCallback((startedAt: number, endedAt?: number) => {
    const totalMs = (endedAt ?? Date.now()) - startedAt;
    const minutes = Math.floor(totalMs / 60000);
    const seconds = Math.floor((totalMs % 60000) / 1000);
    return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
  }, []);

  const sessionModeLabel = useCallback((mode: SessionHistoryEntry['session']['mode']) => {
    return mode === 'whisper-stt' ? 'Whisper STT' : 'Native STT';
  }, []);

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
      <View style={styles.sessionCard}>
        <Text style={styles.sessionTitle}>Last session</Text>
        {lastSession ? (
          <>
            <Text style={styles.sessionStat}>
              Duration: {formatDuration(lastSession.session.startedAt, lastSession.session.endedAt)}
            </Text>
            <Text style={styles.sessionStat}>Turns: {lastSession.session.turnsCount}</Text>
            <Text style={styles.sessionStat}>Hints: {lastSession.session.hintsCount}</Text>
            <Text style={styles.sessionStat}>Mode: {sessionModeLabel(lastSession.session.mode)}</Text>
          </>
        ) : (
          <Text style={styles.sessionHelper}>No sessions yet. Start a conversation to begin learning.</Text>
        )}
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
  },
  sessionCard: {
    marginTop: 24,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12
  },
  sessionStat: {
    fontSize: 14,
    color: '#475569'
  },
  sessionHelper: {
    fontSize: 14,
    color: '#94a3b8'
  }
});
