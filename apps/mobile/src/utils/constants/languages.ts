export const SUPPORTED_LANGUAGES = [
  { code: 'es-ES', label: 'Spanish (Spain)' },
  { code: 'en-US', label: 'English (US)' },
  { code: 'pl-PL', label: 'Polish' },
  { code: 'de-DE', label: 'German' },
  { code: 'fr-FR', label: 'French' }
] as const;

export const LEARNER_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }
] as const;

export type LearnerLevel = (typeof LEARNER_LEVELS)[number]['value'];
export type LanguageOption = (typeof SUPPORTED_LANGUAGES)[number];
