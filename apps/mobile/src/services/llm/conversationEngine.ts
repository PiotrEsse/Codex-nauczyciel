import { useSettingsStore } from '@state/settingsStore';

export type ConversationTurn = {
  id: string;
  role: 'user' | 'lumi';
  content: string;
  createdAt: number;
};

export class ConversationEngine {
  private turns: ConversationTurn[] = [];

  getTurns() {
    return this.turns;
  }

  appendTurn(turn: ConversationTurn) {
    this.turns = [...this.turns, turn];
  }

  reset() {
    this.turns = [];
  }

  async generateResponse(userMessage: string): Promise<string> {
    const { learnerLevel, targetLanguage } = useSettingsStore.getState();
    const difficultyPrefix =
      learnerLevel === 'beginner'
        ? 'Simple'
        : learnerLevel === 'intermediate'
        ? 'Helpful'
        : 'Challenging';
    const encouragement =
      learnerLevel === 'beginner'
        ? 'Try to respond with a full sentence.'
        : learnerLevel === 'intermediate'
        ? 'Add one more detail to your answer.'
        : 'Share a nuanced opinion or example.';
    return `${difficultyPrefix} reply in ${targetLanguage}: ${userMessage}. ${encouragement}`;
  }

  async generateHint(): Promise<{ targetText: string; nativeText: string }> {
    const { targetLanguage, nativeLanguage, learnerLevel } = useSettingsStore.getState();
    const lastUserTurn = [...this.turns].reverse().find((turn) => turn.role === 'user');
    const topic = lastUserTurn?.content ?? 'introduce yourself';
    const detailPrompt =
      learnerLevel === 'beginner'
        ? 'focus on simple vocabulary and clear pronunciation'
        : learnerLevel === 'intermediate'
        ? 'add descriptive words and connect your ideas'
        : 'use complex sentences and nuanced expressions';
    return {
      targetText: `Think about "${topic}" and ${detailPrompt} in ${targetLanguage}.`,
      nativeText: `Podpowiedź (${nativeLanguage}): spróbuj rozwinąć temat "${topic}" i ${detailPrompt}.`
    };
  }
}

export const conversationEngine = new ConversationEngine();
