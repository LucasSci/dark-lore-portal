# Palette's Journal - Critical UX/A11y Learnings
## 2026-05-30 - Replace window.confirm with ConfirmActionDialog
**Learning:** Replacing native browser window.confirm dialogs with custom React dialogs like ConfirmActionDialog provides a more consistent, accessible, and integrated user experience for destructive actions like deleting projects.
**Action:** Use ConfirmActionDialog for destructive actions and ensure the dialog logic is cleanly separated into state management and confirmation execution.
