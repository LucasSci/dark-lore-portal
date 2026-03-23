## YYYY-MM-DD - Sentinel Initialization
**Vulnerability:** Initial creation of Sentinel's journal.
**Learning:** This journal tracks critical security learnings, as required by Sentinel's instructions.
**Prevention:** Refer to this journal before starting new tasks.

## 2024-05-24 - Insecure Random Number Generation
**Vulnerability:** `Math.random()` and `Date.now()` string concatenation was used to generate IDs across various core logic components.
**Learning:** These sources are predictable, creating a risk for insecure ID generation and related vulnerabilities.
**Prevention:** Always use `crypto.randomUUID()` for generating unique IDs (like asset IDs, entity IDs, connection IDs) to ensure cryptographic uniqueness and prevent enumeration or prediction.