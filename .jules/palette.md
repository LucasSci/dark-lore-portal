# Palette's Journal - Critical UX/A11y Learnings

## 2024-06-01 - Replace native confirm dialog with React component
**Learning:** Replacing blocking native browser dialogs (window.confirm) with custom React dialogs requires splitting the inline action logic into a trigger handler and a confirm handler to properly isolate state changes and ensure a clean execution flow.
**Action:** Always safely split the action logic into two distinct useCallback hooks when migrating to ConfirmActionDialog.
