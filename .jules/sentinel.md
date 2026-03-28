## 2024-05-18 - [Fix Weak PRNG in VTT Entity Generation]
**Vulnerability:** The Virtual Tabletop module utilized `Math.random().toString(36)` and raw fallback ID logic for critical entity and chat message generation instead of cryptographically secure alternatives.
**Learning:** This existed because standard ID generators were isolated and fallback mechanisms for non-secure contexts (like HTTP) required robust wrappers. `Math.random()` provides insufficient entropy, making IDs predictable.
**Prevention:** Use centralized `generateSecureId` and `generateSecureShortId` in `src/lib/utils.ts` which securely wrap `crypto.randomUUID()` and `crypto.getRandomValues()` while retaining safe local fallbacks.
