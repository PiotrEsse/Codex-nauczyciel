# Developer Getting Started Guide

## 1. Tooling Prerequisites
- Node.js 20 LTS, npm 10+.
- Expo CLI (`npm install -g expo-cli`).
- Xcode 15 (for iOS builds) or Android Studio Giraffe+ with SDK 34.
- Watchman (macOS) for faster reloads.
- Git LFS (for future audio samples).

## 2. Repository Setup
```bash
git clone <repo-url>
cd language-tutor
npm install
cp .env.example .env # placeholder for future secrets
```

## 3. Project Scripts
| Command | Description |
| --- | --- |
| `npm run start` | Launch Expo dev server (Metro). |
| `npm run lint` | Run ESLint with recommended React Native + TypeScript config. |
| `npm run typecheck` | Execute `tsc --noEmit`. |
| `npm run test` | Placeholder for Jest unit tests (to be populated). |

## 4. Coding Standards
- TypeScript strict mode enabled.
- ESLint config: `@react-native/eslint-config`, plugin `react-hooks`, `@typescript-eslint`.
- Prettier with default settings; run via pre-commit hook (`lint-staged`).
- Folder structure (planned):
  - `src/screens/` – React components per screen.
  - `src/services/` – Speech, storage, LLM orchestration.
  - `src/state/` – Zustand stores for session data.
  - `src/utils/` – Helper functions.
  - `src/assets/` – icons, sounds (if any).

## 5. Running on Devices
- **iOS**: `npm run ios` (requires Xcode + simulator). For physical device, use Expo Go with tunnel connection.
- **Android**: `npm run android` (Android Studio emulator) or scan QR code in Expo Go.
- Ensure microphone permissions are granted in emulator (Settings → Apps → Expo → Permissions).

## 6. Secrets Management
- Whisper API key stored via `SecureStore`. During dev, load from `.env` and inject via `app.config.js` to Settings screen default.
- Do not commit `.env` or device logs containing API keys.

## 7. CI/CD Outline
- GitHub Actions workflow (to be added) running `npm ci`, `npm run lint`, `npm run typecheck` on push.
- Future step: integrate EAS Build for nightly beta.

## 8. Next Steps
- Create Expo project skeleton with TypeScript template.
- Add ESLint/Prettier config files matching standards above.
- Implement feature flags for Whisper vs native STT once speech services spike is complete.
