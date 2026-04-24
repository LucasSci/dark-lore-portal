## 2024-05-18 - Avoid Math.random() for Secure Identifiers
**Vulnerability:** Core systems (Virtual Tabletop, real-time sync, asset manifest) generated collision-prone, predictable identifiers via `Math.random().toString(36)` instead of utilizing native, cryptographically secure random values.
**Learning:** `Math.random()` lacks required entropy and predictability guarantees needed for secure ID generation (such as session connection IDs or unique sheet request IDs), increasing vulnerability to ID collisions and potential session/asset hijacking.
**Prevention:** Always use the centralized `generateSecureId()` or `generateSecureShortId()` from `src/lib/utils.ts` to tap into `crypto.randomUUID()` and `crypto.getRandomValues()` respectively, assuring robust fallback behaviors are present without compromising security in supporting contexts.
## 2024-05-18 - Avoid allow-same-origin in sandboxed iframes rendering dynamic content
**Vulnerability:** The AI-generated visual environment (`appCode`) for Oracle Luna was rendered in an `iframe` that had both `allow-scripts` and `allow-same-origin` in its `sandbox` attribute. This permitted the dynamic, potentially untrusted AI HTML to interact with the main application's origin, posing a serious Cross-Site Scripting (XSS) risk.
**Learning:** Using `allow-same-origin` inside an iframe that renders user or AI-generated content breaks the isolation boundary, allowing the iframe script to traverse the DOM (`window.parent`), read cookies, and access `localStorage`.
**Prevention:** Never use `allow-same-origin` alongside `allow-scripts` in a sandboxed iframe intended for untrusted content. Let the iframe be isolated into an opaque origin.
## 2024-05-20 - Avoid Date.now() for unique identifiers
**Vulnerability:** Several RPG components (CombatTracker, GameMasterPanel, publications) used `Date.now().toString()` or `${Date.now()}` to generate unique IDs for new entities, publications, and combatants.
**Learning:** `Date.now()` is highly predictable and can generate duplicate IDs if multiple entities are created within the same millisecond (e.g., during rapid UI interactions, bulk creation, or automated testing). This causes React rendering bugs (duplicate keys) and potential ID collision vulnerabilities.
**Prevention:** Always use the centralized `generateSecureId()` utility for ID generation in React state and store objects, ensuring uniqueness and security.

## 2024-05-24 - Prevent Secret Exposure in .env Files
**Vulnerability:** A production `.env` file containing critical secrets, such as `VITE_GEMINI_API_KEY` and Supabase keys, was tracked and committed to version control, exposing sensitive credentials to anyone with read access to the repository.
**Learning:** By default, if a  is missing rules for  files, standard Git commands will add them. This creates severe, automated secret leakage. Removing a secret from codebase also means purging it from git history or ensuring the secret is rotated, but the first step is always removing the file from the current working tree and adding it to .
**Prevention:** Never commit  or related environment files to version control. Always ensure `.env` and `.env.*` are listed in `.gitignore`. Provide a sanitized `.env.example` file to document required variables instead.
## 2024-05-24 - Prevent Secret Exposure in .env Files
**Vulnerability:** A production .env file containing critical secrets, such as VITE_GEMINI_API_KEY and Supabase keys, was tracked and committed to version control, exposing sensitive credentials to anyone with read access to the repository.
**Learning:** By default, if a .gitignore is missing rules for .env files, standard Git commands will add them. This creates severe, automated secret leakage. Removing a secret from codebase also means purging it from git history or ensuring the secret is rotated, but the first step is always removing the file from the current working tree and adding it to .gitignore.
**Prevention:** Never commit .env or related environment files to version control. Always ensure .env and .env.* are listed in .gitignore. Provide a sanitized .env.example file to document required variables instead.
