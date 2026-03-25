## 2024-05-24 - Unsecure ID Generation using Math.random()
**Vulnerability:** Core application ID generation logic for tables, chat IDs, connection IDs, and UUID fallbacks relied on `Math.random().toString(36)`.
**Learning:** `Math.random()` is not a cryptographically secure random number generator, opening up the possibility of ID predictability, potentially leading to insecure direct object references or clashes in a distributed/collaborative state system like the virtual tabletop.
**Prevention:** Centralized random ID generation in `src/lib/utils.ts` to `generateSecureId` and `generateSecureShortId`, preferring `crypto.randomUUID()` and `crypto.getRandomValues()` respectively over `Math.random()` except as an absolute last resort on insecure networks.
