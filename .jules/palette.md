# Palette's Journal - Critical UX/A11y Learnings
## 2026-07-03 - Replace blocking native dialogs
**Learning:** Native `window.confirm` dialogs block the main thread and provide poor UX. Replacing them with non-blocking React components like `ConfirmActionDialog` improves user flow and consistency.
**Action:** Use `ConfirmActionDialog` instead of `window.confirm` for destructive actions.
