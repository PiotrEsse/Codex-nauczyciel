import type { ExpoConfig } from '@expo/config';

const defineConfig = (): ExpoConfig => ({
  name: 'Language Tutor',
  slug: 'language-tutor',
  version: '0.1.0',
  orientation: 'portrait',
  scheme: 'languagetutor',
  userInterfaceStyle: 'light',
  updates: {
    fallbackToCacheTimeout: 0
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.codex.languagetutor',
    infoPlist: {
      NSMicrophoneUsageDescription: 'Lumi needs to access your microphone to practice speaking with you.'
    }
  },
  android: {
    package: 'com.codex.languagetutor',
    permissions: ['RECORD_AUDIO']
  },
  extra: {
    eas: {
      projectId: '00000000-0000-0000-0000-000000000000'
    }
  }
});

export default defineConfig;
