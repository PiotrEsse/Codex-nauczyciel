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
2. Set **Speech-to-text provider** to **Whisper (OpenAI)**.
3. Paste the key into **Whisper API Key** (stored in secure store) and adjust the endpoint if needed.
4. Tap **Save Whisper settings** to persist the credentials.
5. Use **Run Whisper test recording** – after pressing Start, speak a short sentence in the target language.
6. Review the transcript shown in the confirmation dialog. If the request fails, check:
   - Network connectivity.
   - API key validity (HTTP 401 errors).
   - Rate limit headers (consider retry after delay).

## 4. Usage Guidelines
- Audio uploaded as high-quality AAC (m4a) via Expo's recording APIs (Whisper accepts m4a/mp3/wav/webm).
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
