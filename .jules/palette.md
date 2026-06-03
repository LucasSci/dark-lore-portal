# Palette's Journal - Critical UX/A11y Learnings

## 2024-05-24 - Replace native confirm with custom dialog
**Learning:** Native window.confirm blocks the main thread and breaks the visual consistency of the design system. Replacing it with a custom React component improves accessibility and consistency.
**Action:** Use ConfirmActionDialog or similar accessible components for destructive actions instead of window.confirm.
