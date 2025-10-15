import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { RootStackParamList } from '@navigation/RootNavigator';
import { conversationEngine } from '@services/llm/conversationEngine';
import { SpeechService } from '@services/speech/speechService';

import type { ConversationTurn } from '@services/llm/conversationEngine';

const MICROPHONE_IDLE_TEXT = 'Hold to speak';
const MICROPHONE_RECORDING_TEXT = 'Release to send';

type Props = NativeStackScreenProps<RootStackParamList, 'Conversation'>;

export const ConversationScreen: React.FC<Props> = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [statusMessage, setStatusMessage] = useState(MICROPHONE_IDLE_TEXT);
  const [turns, setTurns] = useState<ConversationTurn[]>(conversationEngine.getTurns());

  const handleSpeechResult = useCallback(async (transcript: string) => {
    const userTurn: ConversationTurn = {
      id: `${Date.now()}-user`,
      role: 'user',
      content: transcript,
      createdAt: Date.now()
    };
    conversationEngine.appendTurn(userTurn);
    setTurns(conversationEngine.getTurns());
    setStatusMessage('Thinking...');

    const reply = await conversationEngine.generateResponse(transcript);
    const aiTurn: ConversationTurn = {
      id: `${Date.now()}-lumi`,
      role: 'lumi',
      content: reply,
      createdAt: Date.now()
    };
    conversationEngine.appendTurn(aiTurn);
    setTurns(conversationEngine.getTurns());
    SpeechService.speak(reply);
    setStatusMessage(MICROPHONE_IDLE_TEXT);
  }, []);

  const handleSpeechError = useCallback((error: Error) => {
    setStatusMessage(MICROPHONE_IDLE_TEXT);
    Alert.alert('We could not understand you', error.message);
  }, []);

  const onPressIn = useCallback(async () => {
    setIsRecording(true);
    setStatusMessage(MICROPHONE_RECORDING_TEXT);
    await SpeechService.startListening({
      onResult: handleSpeechResult,
      onError: handleSpeechError
    });
  }, [handleSpeechError, handleSpeechResult]);

  const onPressOut = useCallback(async () => {
    setIsRecording(false);
    await SpeechService.stopListening();
  }, []);

  const renderItem = useCallback(({ item }: { item: ConversationTurn }) => (
    <View style={[styles.messageBubble, item.role === 'lumi' ? styles.aiBubble : styles.userBubble]}>
      <Text style={styles.messageSpeaker}>{item.role === 'lumi' ? 'Lumi' : 'You'}</Text>
      <Text style={styles.messageText}>{item.content}</Text>
    </View>
  ), []);

  const listData = useMemo(() => turns.slice().reverse(), [turns]);

  useEffect(() => {
    return () => {
      SpeechService.cancel();
    };
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={listData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        inverted
      />
      <View style={styles.microphoneContainer}>
        <Text style={styles.status}>{statusMessage}</Text>
        <Pressable
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          style={[styles.microphoneButton, isRecording && styles.microphoneButtonActive]}
        >
          <Text style={styles.microphoneLabel}>{isRecording ? 'Listening...' : 'Hold to talk'}</Text>
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
  microphoneContainer: {
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
  microphoneButtonActive: {
    backgroundColor: '#ef4444'
  },
  microphoneLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600'
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
  }
});
