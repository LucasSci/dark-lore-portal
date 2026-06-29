# Palette's Journal - Critical UX/A11y Learnings
## 2025-03-05 - Replace window.confirm with ConfirmActionDialog
**Learning:** Replacing native browser dialogs with custom React dialogs (e.g. ConfirmActionDialog) provides a smoother and more visually consistent UX for destructive actions without relying on `window.confirm` blocking the thread.
**Action:** Always prefer the design system's ConfirmActionDialog wrapper over `window.confirm`.
