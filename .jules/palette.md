# Palette's Journal - Critical UX/A11y Learnings

## 2026-06-05 - Replacing window.confirm with ConfirmActionDialog
**Learning:** Replacing native window.confirm requires cleanly splitting the inline logic into two separate handlers (open dialog and execute action) to manage React state correctly.
**Action:** Always split action logic into a UI trigger and an execution callback when migrating from native dialogs.
