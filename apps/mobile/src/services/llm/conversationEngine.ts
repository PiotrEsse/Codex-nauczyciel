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
    // Placeholder implementation until LLM integration is added.
    const difficultyPrefix =
      learnerLevel === 'beginner'
        ? 'Simple'
        : learnerLevel === 'intermediate'
        ? 'Helpful'
        : 'Challenging';
    return `${difficultyPrefix} reply in ${targetLanguage}: ${userMessage}`;
  }
}

export const conversationEngine = new ConversationEngine();
