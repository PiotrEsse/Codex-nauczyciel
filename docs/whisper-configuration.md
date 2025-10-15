# Whisper Configuration Checklist

## 1. Prerequisites
- OpenAI account with API access.
- Billing enabled (usage-based charges apply).
- Latest Expo Go / development build installed on test devices.

## 2. Obtain API Key
1. Visit https://platform.openai.com/account/api-keys.
2. Click **Create new secret key** → name it `LanguageTutor-MVP`.
3. Copy the key immediately; store in a secure password manager.

## 3. App Configuration Steps
1. Open Settings → Speech Services.
2. Enable **Use Whisper STT** toggle.
3. Paste API key into the **Whisper API Key** field (stored in secure store).
4. Leave **Endpoint URL** as default `https://api.openai.com/v1/audio/transcriptions` unless instructed otherwise.
5. Choose model `whisper-1` from dropdown.
6. Tap **Run test recognition** → speak short sentence in target language.
7. Verify transcript appears correctly. If request fails, check:
   - Network connectivity.
   - API key validity (HTTP 401 errors).
   - Rate limit headers (consider retry after delay).

## 4. Usage Guidelines
- Audio uploaded as 16-bit PCM WAV, 16 kHz mono.
- Limit each utterance to ≤ 30 seconds for responsive UX.
- Handle API errors gracefully: show toast with error and log in debug storage.
- Cache last successful transcript for offline viewing, but do not store raw audio beyond active session.

## 5. Troubleshooting Table
| Symptom | Possible Cause | Mitigation |
| --- | --- | --- |
| 401 Unauthorized | Invalid/expired API key | Prompt user to re-enter key; validate format before sending. |
| 429 Rate limit | Too many requests | Backoff 30s, inform user, encourage shorter utterances. |
| 500 Server error | Whisper service issue | Retry once; if still failing, fall back to native STT automatically. |
| Long latency | Large audio payload or slow network | Clip recordings to 10s, compress with Opus before upload (future enhancement). |

## 6. Security Notes
- API key never logged or exported.
- Secure store access wrapped in platform-specific encryption.
- When user clears data, ensure Whisper key is deleted from secure storage.
