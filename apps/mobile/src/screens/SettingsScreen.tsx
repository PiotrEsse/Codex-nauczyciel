import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';

import { RootStackParamList } from '@navigation/RootNavigator';
import { LogService } from '@services/logging/logService';
import { SpeechService } from '@services/speech/speechService';
import { StorageService } from '@services/storage/storageService';
import { useSessionStore } from '@state/sessionStore';
import { useSettingsStore } from '@state/settingsStore';
import { LEARNER_LEVELS, SUPPORTED_LANGUAGES, type LanguageOption } from '@utils/constants/languages';

const STT_OPTIONS = [
  { value: 'native', label: 'System speech recognition' },
  { value: 'whisper', label: 'Whisper (OpenAI)' }
] as const;

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export const SettingsScreen: React.FC<Props> = () => {
  const {
    targetLanguage,
    nativeLanguage,
    learnerLevel,
    speech,
    audio,
    whisperApiKey,
    whisperEndpoint,
    setTargetLanguage,
    setNativeLanguage,
    setLearnerLevel,
    setSpeechProvider,
    setTtsRate,
    setNormalizeAudio,
    updateWhisperCredentials
  } = useSettingsStore();

  const [localApiKey, setLocalApiKey] = useState(whisperApiKey ?? '');
  const [localEndpoint, setLocalEndpoint] = useState(whisperEndpoint ?? '');
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [isExportingSession, setIsExportingSession] = useState(false);
  const [isFetchingLogs, setIsFetchingLogs] = useState(false);
  const [isExportingLogs, setIsExportingLogs] = useState(false);
  const [isClearingHistory, setIsClearingHistory] = useState(false);
  const [isTestingWhisper, setIsTestingWhisper] = useState(false);
  const resetSession = useSessionStore((state) => state.reset);

  const validateApiKey = useCallback((value: string) => {
    if (!value) {
      return true;
    }
    return /^sk-[A-Za-z0-9]{32,}$/.test(value.trim());
  }, []);

  const handleSaveWhisperConfig = useCallback(async () => {
    if (!validateApiKey(localApiKey)) {
      Alert.alert('Invalid Whisper key', 'Please check the format and try again.');
      return;
    }
    setIsSavingKey(true);
    try {
      await updateWhisperCredentials({ apiKey: localApiKey.trim(), endpoint: localEndpoint.trim() });
      Alert.alert('Saved', 'Whisper configuration updated.');
    } finally {
      setIsSavingKey(false);
    }
  }, [localApiKey, localEndpoint, updateWhisperCredentials, validateApiKey]);

  const currentSttLabel = useMemo(
    () => STT_OPTIONS.find((option) => option.value === speech.stt)?.label ?? 'Unknown',
    [speech.stt]
  );

  const handleExportLatest = useCallback(async () => {
    if (isExportingSession) {
      return;
    }
    setIsExportingSession(true);
    void LogService.info('settings', 'Preparing latest session export');
    try {
      const [latest] = await StorageService.getRecentSessions(1);
      if (!latest) {
        Alert.alert('No sessions yet', 'Start a conversation to generate session logs.');
        void LogService.warn('settings', 'Session export skipped, history empty');
        return;
      }
      const payload = StorageService.buildSessionExportPayload(latest);
      console.log('[LanguageTutor][SessionExport]', JSON.stringify(payload, null, 2));
      Alert.alert('Export ready', 'Latest session JSON was printed to the debug console.');
      void LogService.info('settings', 'Session export completed');
    } finally {
      setIsExportingSession(false);
    }
  }, [isExportingSession]);

  const handleViewRecentSessions = useCallback(async () => {
    void LogService.info('settings', 'Viewing recent session summary');
    const sessions = await StorageService.getRecentSessions(5);
    if (sessions.length === 0) {
      Alert.alert('No history found', 'Conversations will appear here once you talk to Lumi.');
      void LogService.warn('settings', 'No sessions available when requesting summary');
      return;
    }
    const summary = sessions
      .map((entry) => {
        const started = new Date(entry.session.startedAt).toLocaleString();
        return `${started} • ${entry.session.turnsCount} turns • ${entry.session.hintsCount} hints`;
      })
      .join('\n');
    Alert.alert('Recent sessions', summary);
  }, []);

  const handleViewLogEvents = useCallback(async () => {
    if (isFetchingLogs) {
      return;
    }
    setIsFetchingLogs(true);
    void LogService.info('settings', 'Fetching recent log events');
    try {
      const events = await LogService.getRecent(10);
      if (events.length === 0) {
        Alert.alert('No log entries', 'Log events will appear here after you interact with the tutor.');
        void LogService.warn('settings', 'No log events captured yet');
        return;
      }
      const summary = events
        .map((event) => {
          const timestamp = new Date(event.timestamp).toLocaleTimeString();
          return `${timestamp} [${event.level.toUpperCase()}] ${event.scope} — ${event.message}`;
        })
        .join('\n');
      Alert.alert('Recent log events', summary);
    } finally {
      setIsFetchingLogs(false);
    }
  }, [isFetchingLogs]);

  const handleExportLogs = useCallback(async () => {
    if (isExportingLogs) {
      return;
    }
    setIsExportingLogs(true);
    void LogService.info('settings', 'Preparing debug log export');
    try {
      const payload = await LogService.buildExportPayload();
      console.log('[LanguageTutor][DebugLogExport]', JSON.stringify(payload, null, 2));
      Alert.alert('Log export ready', 'Latest debug log JSON was printed to the console.');
      void LogService.info('settings', 'Debug log export completed', {
        eventsCount: payload.events.length
      });
    } finally {
      setIsExportingLogs(false);
    }
  }, [isExportingLogs]);

  const runWhisperTest = useCallback(async () => {
    setIsTestingWhisper(true);
    void LogService.info('settings', 'Running Whisper configuration test');
    try {
      const transcript = await SpeechService.runWhisperConfigurationTest();
      if (transcript.trim().length === 0) {
        Alert.alert('Test complete', 'The request finished but no speech was detected. Try again with a louder sample.');
      } else {
        Alert.alert('Whisper test transcript', transcript);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error while testing Whisper.';
      Alert.alert('Whisper test failed', message);
      void LogService.error('settings', 'Whisper configuration test failed', { message });
    } finally {
      setIsTestingWhisper(false);
    }
  }, []);

  const handleTestWhisper = useCallback(() => {
    if (!whisperApiKey) {
      Alert.alert('Missing Whisper key', 'Add your Whisper API key before running the test.');
      return;
    }
    Alert.alert(
      'Run Whisper test',
      'We will record a short sample (about 3 seconds). Speak clearly in your target language once you press Start.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start',
          onPress: () => {
            void runWhisperTest();
          }
        }
      ]
    );
  }, [runWhisperTest, whisperApiKey]);

  const handleClearHistory = useCallback(() => {
    if (isClearingHistory) {
      return;
    }
    Alert.alert('Clear all session history?', 'This will remove locally stored conversations.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear history',
        style: 'destructive',
        onPress: async () => {
          setIsClearingHistory(true);
          try {
            void LogService.warn('settings', 'Clearing session history and log events');
            await StorageService.clearSessionHistory();
            await LogService.clear();
            resetSession();
            Alert.alert('History cleared', 'All stored sessions were deleted.');
          } finally {
            setIsClearingHistory(false);
          }
        }
      }
    ]);
  }, [isClearingHistory, resetSession]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Languages & Level</Text>
        <Text style={styles.label}>Target language</Text>
        <Picker selectedValue={targetLanguage} onValueChange={setTargetLanguage}>
          {SUPPORTED_LANGUAGES.map((language: LanguageOption) => (
            <Picker.Item key={language.code} label={language.label} value={language.code} />
          ))}
        </Picker>
        <Text style={styles.label}>Native language</Text>
        <Picker selectedValue={nativeLanguage} onValueChange={setNativeLanguage}>
          {SUPPORTED_LANGUAGES.map((language: LanguageOption) => (
            <Picker.Item key={language.code} label={language.label} value={language.code} />
          ))}
        </Picker>
        <Text style={styles.label}>Learner level</Text>
        <Picker selectedValue={learnerLevel} onValueChange={setLearnerLevel}>
          {LEARNER_LEVELS.map((level) => (
            <Picker.Item key={level.value} label={level.label} value={level.value} />
          ))}
        </Picker>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Speech Services</Text>
        <Text style={styles.label}>Speech-to-text provider</Text>
        <Picker selectedValue={speech.stt} onValueChange={setSpeechProvider}>
          {STT_OPTIONS.map((option) => (
            <Picker.Item key={option.value} label={option.label} value={option.value} />
          ))}
        </Picker>
        {speech.stt === 'whisper' && (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>
              Whisper requires an OpenAI API key. The key is stored securely on your device and never
              leaves it.
            </Text>
          </View>
        )}
        <Text style={styles.label}>Whisper API key</Text>
        <TextInput
          value={localApiKey}
          onChangeText={setLocalApiKey}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry
          placeholder="sk-..."
          style={styles.input}
        />
        <Text style={styles.label}>Whisper endpoint</Text>
        <TextInput
          value={localEndpoint}
          onChangeText={setLocalEndpoint}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="https://api.openai.com/v1/audio/transcriptions"
          style={styles.input}
        />
        <Text style={styles.helper}>Current STT: {currentSttLabel}</Text>
        <Text style={styles.saveButton} onPress={isSavingKey ? undefined : handleSaveWhisperConfig}>
          {isSavingKey ? 'Saving...' : 'Save Whisper settings'}
        </Text>
        <Pressable
          style={[styles.debugButton, isTestingWhisper && styles.debugButtonDisabled]}
          onPress={handleTestWhisper}
          disabled={isTestingWhisper}
        >
          <Text style={styles.debugButtonText}>
            {isTestingWhisper ? 'Testing Whisper…' : 'Run Whisper test recording'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Audio Behaviour</Text>
        <Text style={styles.label}>TTS rate (0.5 - 1.5)</Text>
        <TextInput
          keyboardType="decimal-pad"
          value={audio.ttsRate.toString()}
          onChangeText={(value) => {
            const parsed = Number.parseFloat(value);
            if (!Number.isNaN(parsed)) {
              const clamped = Math.min(Math.max(parsed, 0.5), 1.5);
              setTtsRate(Number(clamped.toFixed(2)));
            }
          }}
          style={styles.input}
        />
        <View style={styles.switchRow}>
          <Text style={styles.label}>Normalize volume</Text>
          <Switch value={audio.normalize} onValueChange={setNormalizeAudio} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data & Debug</Text>
        <Pressable
          style={styles.debugButton}
          onPress={handleExportLatest}
          disabled={isExportingSession}
        >
          <Text style={styles.debugButtonText}>
            {isExportingSession ? 'Preparing export…' : 'Export latest session'}
          </Text>
        </Pressable>
        <Pressable style={styles.debugButton} onPress={handleViewRecentSessions}>
          <Text style={styles.debugButtonText}>View recent sessions</Text>
        </Pressable>
        <Pressable
          style={styles.debugButton}
          onPress={handleViewLogEvents}
          disabled={isFetchingLogs}
        >
          <Text style={styles.debugButtonText}>
            {isFetchingLogs ? 'Loading logs…' : 'View recent log events'}
          </Text>
        </Pressable>
        <Pressable
          style={styles.debugButton}
          onPress={handleExportLogs}
          disabled={isExportingLogs}
        >
          <Text style={styles.debugButtonText}>
            {isExportingLogs ? 'Preparing log export…' : 'Export debug log'}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.debugButton, styles.debugButtonDanger]}
          onPress={handleClearHistory}
          disabled={isClearingHistory}
        >
          <Text style={styles.debugButtonDangerText}>
            {isClearingHistory ? 'Clearing…' : 'Clear session history'}
          </Text>
        </Pressable>
        <Text style={styles.helper}>
          Exports are printed to the development console. Use the clear action to remove local transcripts and purge
          debug logs when necessary.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 64,
    gap: 24
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1e293b'
  },
  label: {
    fontSize: 14,
    color: '#475569',
    marginTop: 12
  },
  helper: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 8
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5f5',
    borderRadius: 12,
    padding: 12,
    marginTop: 8
  },
  notice: {
    backgroundColor: '#e0f2fe',
    padding: 12,
    borderRadius: 12,
    marginTop: 12
  },
  noticeText: {
    color: '#0f172a',
    fontSize: 13
  },
  saveButton: {
    marginTop: 16,
    color: '#2563eb',
    fontWeight: '600'
  },
  switchRow: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  debugButton: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#e2e8f0',
    alignItems: 'center'
  },
  debugButtonDisabled: {
    opacity: 0.6
  },
  debugButtonText: {
    color: '#1e293b',
    fontWeight: '600'
  },
  debugButtonDanger: {
    backgroundColor: '#fee2e2'
  },
  debugButtonDangerText: {
    color: '#b91c1c',
    fontWeight: '600'
  }
});
