## 2024-11-20 - [Predictable Upload Paths]
**Vulnerability:** The application used `Date.now()` as part of the storage path when uploading battlemaps, making the URLs predictable and susceptible to enumeration or overwrite attacks (if other mechanisms failed).
**Learning:** Even internal toolings or non-public-facing uploads need randomized, unpredictable paths to prevent unauthorized access or ID collisions.
**Prevention:** Always use cryptographically secure random string generators (like the centralized `generateSecureShortId` or `generateSecureId` utilities) in combination with timestamps or other identifiers when generating file paths for cloud storage.
