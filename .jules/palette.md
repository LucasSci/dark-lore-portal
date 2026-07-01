# Palette's Journal - Critical UX/A11y Learnings
## 2024-07-01 - Replaced window.confirm with ConfirmActionDialog
**Learning:** Native `window.confirm` dialogs block the main thread, ignore the application's design system, and create an abrupt, unstyled UX break. They are often perceived as system errors by users. The custom `ConfirmActionDialog` provides a consistent, accessible experience within the established visual language.
**Action:** Use `ConfirmActionDialog` for all destructive action confirmations instead of native browser prompts.
