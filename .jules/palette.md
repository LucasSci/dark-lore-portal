# Palette's Journal - Critical UX/A11y Learnings

## 2024-06-25 - Oráculo Icon-only buttons accessibility
**Learning:** Icon-only control buttons, especially within specialized, highly visual tools like the Oracle Luna App (e.g. mic control, history navigation), are frequently missing accessible names. This creates a completely opaque experience for screen readers, as the buttons have no text content or visual labels.
**Action:** Always scan for icon-only `<button>` tags when reviewing UI components. Ensure `aria-label` attributes are added with concise, localized (Portuguese) descriptions (e.g., "Conectar ao Oráculo", "Voltar no histórico") to provide clear intent for assistive technologies.
