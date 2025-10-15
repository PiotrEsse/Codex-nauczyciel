import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';

import { RootStackParamList } from '@navigation/RootNavigator';
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
  }
});
