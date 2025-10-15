import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

import { RootStackParamList } from '@navigation/RootNavigator';
import { conversationEngine, type ConversationTurn } from '@services/llm/conversationEngine';
import { SpeechService } from '@services/speech/speechService';
import {
  type SessionHintRecord,
  type SessionTurnRecord
} from '@services/storage/storageService';
import { useSessionStore } from '@state/sessionStore';
import { useSettingsStore } from '@state/settingsStore';

const MICROPHONE_IDLE_TEXT = 'Hold to speak';
const MICROPHONE_RECORDING_TEXT = 'Release to send';

const QUICK_ACTION_LABELS = {
  pause: 'Pause',
  resume: 'Resume',
  hint: 'Ask for hint',
  end: 'End session'
} as const;

type Props = NativeStackScreenProps<RootStackParamList, 'Conversation'>;

type TimelineItem =
  | { type: 'turn'; createdAt: number; item: ConversationTurn }
  | { type: 'hint'; createdAt: number; item: SessionHintRecord };

export const ConversationScreen: React.FC<Props> = ({ navigation }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [statusMessage, setStatusMessage] = useState(MICROPHONE_IDLE_TEXT);
  const [turns, setTurns] = useState<ConversationTurn[]>([]);
  const [isHintLoading, setIsHintLoading] = useState(false);
  const hintResetTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sessionStatus = useSessionStore((state) => state.status);
  const currentSession = useSessionStore((state) => state.currentSession);
  const startSession = useSessionStore((state) => state.startSession);
  const endSession = useSessionStore((state) => state.endSession);
  const pauseSession = useSessionStore((state) => state.pauseSession);
  const resumeSession = useSessionStore((state) => state.resumeSession);
  const recordTurn = useSessionStore((state) => state.recordTurn);
  const recordHint = useSessionStore((state) => state.recordHint);

  const { speech, whisperApiKey } = useSettingsStore((state) => ({
    speech: state.speech,
    whisperApiKey: state.whisperApiKey
  }));

  const isMicDisabled = speech.stt === 'whisper' && !whisperApiKey;
  const isPaused = sessionStatus === 'paused';

  const ensureSessionId = useCallback(async () => {
    const session = await startSession();
    return session.session.id;
  }, [startSession]);

  useEffect(() => {
    conversationEngine.reset();
    setTurns([]);
    let mounted = true;
    (async () => {
      if (!mounted) {
        return;
      }
      await startSession();
    })();
    return () => {
      mounted = false;
      if (hintResetTimeout.current) {
        clearTimeout(hintResetTimeout.current);
        hintResetTimeout.current = null;
      }
      SpeechService.cancel();
      void endSession();
    };
  }, [endSession, startSession]);

  useEffect(() => {
    if (isPaused) {
      setStatusMessage('Session paused');
    } else if (!isRecording) {
      setStatusMessage(MICROPHONE_IDLE_TEXT);
    }
  }, [isPaused, isRecording]);

  const handleSpeechResult = useCallback(
    async (transcript: string) => {
      const cleanedTranscript = transcript.trim();
      if (!cleanedTranscript) {
        setStatusMessage('We did not catch that. Try again.');
        return;
      }
      const sessionId = await ensureSessionId();
      const userTurn: ConversationTurn = {
        id: `${Date.now()}-user`,
        role: 'user',
        content: cleanedTranscript,
        createdAt: Date.now()
      };
      conversationEngine.appendTurn(userTurn);
      setTurns(conversationEngine.getTurns());
      const userRecord: SessionTurnRecord = {
        id: userTurn.id,
        sessionId,
        speaker: 'user',
        transcript: cleanedTranscript,
        createdAt: userTurn.createdAt
      };
      await recordTurn(userRecord);
      setStatusMessage('Thinking...');

      try {
        const reply = await conversationEngine.generateResponse(cleanedTranscript);
        const aiTurn: ConversationTurn = {
          id: `${Date.now()}-lumi`,
          role: 'lumi',
          content: reply,
          createdAt: Date.now()
        };
        conversationEngine.appendTurn(aiTurn);
        setTurns(conversationEngine.getTurns());
        const aiRecord: SessionTurnRecord = {
          id: aiTurn.id,
          sessionId,
          speaker: 'lumi',
          transcript: reply,
          createdAt: aiTurn.createdAt
        };
        await recordTurn(aiRecord);
        SpeechService.speak(reply);
      } catch (error) {
        console.warn('Failed to generate AI reply', error);
        Alert.alert('Something went wrong', 'We could not craft a reply. Please try again.');
      } finally {
        setStatusMessage(MICROPHONE_IDLE_TEXT);
      }
    },
    [ensureSessionId, recordTurn]
  );

  const handleSpeechError = useCallback((error: Error) => {
    setStatusMessage(MICROPHONE_IDLE_TEXT);
    Alert.alert('We could not understand you', error.message);
  }, []);

  const onPressIn = useCallback(async () => {
    if (isMicDisabled || isPaused) {
      return;
    }
    await ensureSessionId();
    setIsRecording(true);
    setStatusMessage(MICROPHONE_RECORDING_TEXT);
    try {
      await SpeechService.startListening({
        onResult: handleSpeechResult,
        onError: handleSpeechError
      });
    } catch (error) {
      setIsRecording(false);
      setStatusMessage(MICROPHONE_IDLE_TEXT);
      const err = error instanceof Error ? error : new Error('Failed to start recording');
      handleSpeechError(err);
    }
  }, [ensureSessionId, handleSpeechError, handleSpeechResult, isMicDisabled, isPaused]);

  const onPressOut = useCallback(async () => {
    if (!isRecording) {
      return;
    }
    setIsRecording(false);
    await SpeechService.stopListening();
  }, [isRecording]);

  const handleTogglePause = useCallback(async () => {
    if (sessionStatus === 'paused') {
      resumeSession();
      setStatusMessage(MICROPHONE_IDLE_TEXT);
    } else {
      await SpeechService.stopListening();
      pauseSession();
      setIsRecording(false);
      setStatusMessage('Session paused');
    }
  }, [pauseSession, resumeSession, sessionStatus]);

  const handleHintRequest = useCallback(async () => {
    if (isHintLoading) {
      return;
    }
    setIsHintLoading(true);
    setStatusMessage('Preparing a hint...');
    let success = false;
    try {
      const sessionId = await ensureSessionId();
      const hint = await conversationEngine.generateHint();
      const record: SessionHintRecord = {
        id: `${Date.now()}-hint`,
        sessionId,
        targetText: hint.targetText,
        nativeText: hint.nativeText,
        createdAt: Date.now()
      };
      await recordHint(record);
      setStatusMessage('Hint ready');
      if (hintResetTimeout.current) {
        clearTimeout(hintResetTimeout.current);
      }
      hintResetTimeout.current = setTimeout(() => {
        setStatusMessage(MICROPHONE_IDLE_TEXT);
        hintResetTimeout.current = null;
      }, 1500);
      success = true;
    } catch (error) {
      console.warn('Failed to prepare hint', error);
      Alert.alert('Hint unavailable', 'Please try again in a moment.');
    } finally {
      if (!success) {
        setStatusMessage(MICROPHONE_IDLE_TEXT);
      }
      setIsHintLoading(false);
    }
  }, [ensureSessionId, isHintLoading, recordHint]);

  const handleEndSession = useCallback(() => {
    Alert.alert('End session?', 'You can review your progress on the home screen.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'End session',
        style: 'destructive',
        onPress: async () => {
          await SpeechService.stopListening();
          await endSession();
          navigation.goBack();
        }
      }
    ]);
  }, [endSession, navigation]);

  const timelineItems = useMemo(() => {
    const hintItems: TimelineItem[] = (currentSession?.hints ?? []).map((hint) => ({
      type: 'hint',
      createdAt: hint.createdAt,
      item: hint
    }));
    const turnItems: TimelineItem[] = turns.map((turn) => ({
      type: 'turn',
      createdAt: turn.createdAt,
      item: turn
    }));
    return [...turnItems, ...hintItems].sort((a, b) => a.createdAt - b.createdAt).reverse();
  }, [currentSession?.hints, turns]);

  const renderItem = useCallback(({ item }: { item: TimelineItem }) => {
    if (item.type === 'hint') {
      const hint = item.item;
      return (
        <View style={[styles.messageBubble, styles.hintBubble]}>
          <Text style={styles.messageSpeaker}>Hint</Text>
          <Text style={styles.messageText}>{hint.targetText}</Text>
          <Text style={styles.hintNative}>{hint.nativeText}</Text>
        </View>
      );
    }
    const turn = item.item;
    return (
      <View style={[styles.messageBubble, turn.role === 'lumi' ? styles.aiBubble : styles.userBubble]}>
        <Text style={styles.messageSpeaker}>{turn.role === 'lumi' ? 'Lumi' : 'You'}</Text>
        <Text style={styles.messageText}>{turn.content}</Text>
      </View>
    );
  }, []);

  const keyExtractor = useCallback((item: TimelineItem) => {
    if (item.type === 'hint') {
      return `hint-${item.item.id}`;
    }
    return `turn-${item.item.id}`;
  }, []);

  const microphoneButtonStyles = useMemo<StyleProp<ViewStyle>>(
    () => [
      styles.microphoneButton,
      (isMicDisabled || isPaused) && (styles.microphoneButtonDisabled as StyleProp<ViewStyle>),
      isRecording && (styles.microphoneButtonRecording as StyleProp<ViewStyle>)
    ],
    [isMicDisabled, isPaused, isRecording]
  );

  const microphoneLabelStyles = useMemo<StyleProp<TextStyle>>(
    () => [
      styles.microphoneLabel,
      isMicDisabled && (styles.microphoneLabelDisabled as StyleProp<TextStyle>)
    ],
    [isMicDisabled]
  );

  return (
    <View style={styles.container}>
      {isMicDisabled && (
        <View style={styles.disabledBanner}>
          <Text style={styles.disabledText}>
            Add your Whisper API key in Settings to enable speech recognition.
          </Text>
          <Text style={styles.bannerAction} onPress={() => navigation.navigate('Settings')}>
            Open settings
          </Text>
        </View>
      )}
      <FlatList
        data={timelineItems}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        inverted
      />
      <View style={styles.footer}>
        <View style={styles.quickActions}>
          <Pressable style={styles.quickActionButton} onPress={handleTogglePause}>
            <Text style={styles.quickActionText}>
              {sessionStatus === 'paused' ? QUICK_ACTION_LABELS.resume : QUICK_ACTION_LABELS.pause}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.quickActionButton, isHintLoading && styles.quickActionDisabled]}
            onPress={handleHintRequest}
            disabled={isHintLoading}
          >
            <Text style={styles.quickActionText}>
              {isHintLoading ? 'Preparing…' : QUICK_ACTION_LABELS.hint}
            </Text>
          </Pressable>
          <Pressable style={styles.quickActionButton} onPress={handleEndSession}>
            <Text style={styles.quickActionText}>{QUICK_ACTION_LABELS.end}</Text>
          </Pressable>
        </View>
        <Text style={styles.status}>{statusMessage}</Text>
        <Pressable
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          disabled={isMicDisabled || isPaused}
          style={microphoneButtonStyles}
        >
          <Text style={microphoneLabelStyles}>
            {isMicDisabled
              ? 'Speech disabled'
              : isPaused
              ? 'Resume to talk'
              : isRecording
              ? 'Listening…'
              : 'Hold to talk'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  listContent: {
    padding: 24
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff'
  },
  status: {
    textAlign: 'center',
    color: '#475569',
    marginBottom: 16
  },
  microphoneButton: {
    backgroundColor: '#2563eb',
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center'
  },
  microphoneButtonRecording: {
    backgroundColor: '#ef4444'
  },
  microphoneButtonDisabled: {
    backgroundColor: '#94a3b8'
  },
  microphoneLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600'
  },
  microphoneLabelDisabled: {
    color: '#1f2937'
  },
  messageBubble: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 18
  },
  aiBubble: {
    backgroundColor: '#2563eb15',
    alignSelf: 'flex-start'
  },
  userBubble: {
    backgroundColor: '#10b98115',
    alignSelf: 'flex-end'
  },
  messageSpeaker: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 4,
    textTransform: 'uppercase'
  },
  messageText: {
    fontSize: 16,
    color: '#1e293b'
  },
  hintBubble: {
    backgroundColor: '#fef3c7',
    alignSelf: 'stretch'
  },
  hintNative: {
    marginTop: 8,
    color: '#92400e'
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  quickActionButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
    alignItems: 'center'
  },
  quickActionText: {
    color: '#1e293b',
    fontWeight: '600'
  },
  quickActionDisabled: {
    opacity: 0.6
  },
  disabledBanner: {
    backgroundColor: '#fee2e2',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#fecaca'
  },
  disabledText: {
    color: '#7f1d1d',
    marginBottom: 8
  },
  bannerAction: {
    color: '#b91c1c',
    fontWeight: '600'
  }
});
