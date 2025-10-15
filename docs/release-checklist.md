# Pre-Release Checklist – MVP Builds

## 1. Build Preparation
- [ ] Update app version in `app.json` / `app.config.ts`.
- [ ] Verify change log for current sprint.
- [ ] Confirm no debug logging of Whisper API key or transcripts.

## 2. QA Sign-off
- [ ] Smoke checklist executed on Android (emulator + physical).
- [ ] Smoke checklist executed on iOS (simulator + physical).
- [ ] Regression checklist from `docs/testing-plan.md` complete with notes.
- [ ] Latency metrics recorded and compared against targets.

## 3. Packaging
- [ ] Run `npm run lint`, `npm run typecheck`, `npm run test` (tests passing).
- [ ] Generate Expo EAS build (`eas build -p android` / `-p ios`).
- [ ] Install build on test devices and run sanity check (start/pause conversation, switch STT mode).

## 4. Beta Distribution
- [ ] Upload Android build to Play Console internal testing.
- [ ] Upload iOS build to App Store Connect TestFlight.
- [ ] Add release notes summarizing new capabilities and known issues.

## 5. Feedback Loop
- [ ] Share tester survey link / feedback form.
- [ ] Monitor crash/usage analytics (Expo, Sentry – once integrated).
- [ ] Schedule retro to capture learnings before next sprint.
