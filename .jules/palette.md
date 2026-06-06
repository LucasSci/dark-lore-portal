# Palette's Journal - Critical UX/A11y Learnings
## 2026-06-06 - Replaced window.confirm with Custom Dialog
**Learning:** Replacing blocking browser dialogs (like `window.confirm`) with React-based UI components requires safely splitting inline action logic into two separate hooks to handle opening the dialog and executing the actual logic.
**Action:** Always use the custom `ConfirmActionDialog` component instead of native `window.confirm` for destructive actions to maintain design system consistency.
