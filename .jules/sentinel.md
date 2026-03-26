## 2024-05-24 - Fix weak ID generation
**Vulnerability:** Insecure ID generation using `Math.random()` for entities and connections, which can lead to predictable IDs.
**Learning:** `Math.random()` is not a cryptographically secure pseudo-random number generator (CSPRNG). It should not be used for security-sensitive operations like generating unique IDs.
**Prevention:** Use `crypto.randomUUID()` or `crypto.getRandomValues()` for secure ID generation, with a fallback to `Math.random()` only for non-secure contexts where crypto is unavailable.
