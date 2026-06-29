## 2024-05-18 - Avoid Math.random() for Secure Identifiers
**Vulnerability:** Core systems (Virtual Tabletop, real-time sync, asset manifest) generated collision-prone, predictable identifiers via `Math.random().toString(36)` instead of utilizing native, cryptographically secure random values.
**Learning:** `Math.random()` lacks required entropy and predictability guarantees needed for secure ID generation (such as session connection IDs or unique sheet request IDs), increasing vulnerability to ID collisions and potential session/asset hijacking.
**Prevention:** Use `crypto.randomUUID()` or a cryptographically secure fallback like `crypto.getRandomValues()` for all newly created entity identifiers, user sessions, or critical system IDs. See `src/lib/utils.ts` for standardized safe generators.

## 2024-05-19 - iframe allow-same-origin risks
**Vulnerability:** The `GameMasterPanel` component rendered external content (Tome of Knowledge, VTT assets) in an `iframe` using the `allow-same-origin` and `allow-scripts` directives without `sandbox` restrictions.
**Learning:** Using `allow-same-origin` inside an iframe that renders user or AI-generated content breaks the isolation boundary, allowing the iframe script to traverse the DOM (`window.parent`), read cookies, and access `localStorage`.
**Prevention:** Use strict `sandbox` attributes (`allow-scripts` only) for iframes rendering unverified content. If `allow-same-origin` is necessary, ensure the content is served from a completely separate, non-privileged origin/domain to mitigate XSS risks.

## 2024-05-20 - Avoid Date.now() for unique identifiers
**Vulnerability:** Several RPG components (CombatTracker, GameMasterPanel, publications) used `Date.now().toString()` or `${Date.now()}` to generate unique IDs for new entities, publications, and combatants.
**Learning:** `Date.now()` is highly predictable and can generate duplicate IDs if multiple entities are created within the same millisecond (e.g., during rapid UI interactions, bulk creation, or automated testing). This causes React rendering bugs (duplicate keys) and potential ID collision vulnerabilities.
**Prevention:** Use cryptographically secure UUIDs (`crypto.randomUUID()`) or the `generateSecureId()` utility from `src/lib/utils.ts` for all newly created entities instead of relying on timestamps for uniqueness.

## 2024-05-21 - Do not track .env files with actual secrets
**Vulnerability:** The project previously tracked an active `.env` file in version control, exposing live Supabase keys, AI keys, and other application secrets to the git history.
**Learning:** Including `.env` in the repository directly violates the security best practice of keeping secrets isolated from version control, making lateral movement or credential abuse easy for any user with repository access.
**Prevention:** Ensure `.env` and `.env.*` (excluding `.env.example`) are explicitly defined in `.gitignore` from project inception. Any template files like `.env.example` should contain only empty or safe placeholder strings.
